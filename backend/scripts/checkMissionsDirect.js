const mongoose = require('mongoose');
const path = require('path');
const Mission = require('../models/Mission');
const Employee = require('../models/Employee');

// Charger la configuration .env comme le serveur principal
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// Configuration de la connexion MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI n\'est pas défini dans le fichier .env');
    }

    console.log('Tentative de connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
};

// Fonction pour analyser les missions mensuelles
const analyzeMonthlyMissions = async () => {
  console.log('\n🔍 ANALYSE DES MISSIONS MENSUELLES');
  console.log('=====================================');

  try {
    // Récupérer toutes les missions mensuelles
    const monthlyMissions = await Mission.find({ type: 'monthly' })
      .populate('employee', 'nom prenom matricule centre poste')
      .sort({ startDate: 1 });

    console.log(`📊 Total des missions mensuelles: ${monthlyMissions.length}`);

    if (monthlyMissions.length === 0) {
      console.log('✅ Aucune mission mensuelle trouvée dans la base de données');
      return {
        totalMissions: 0,
        conflicts: [],
        duplicates: []
      };
    }

    // Grouper par employé
    const missionsByEmployee = {};
    const conflicts = [];
    const duplicates = [];

    monthlyMissions.forEach(mission => {
      const employeeId = mission.employee._id.toString();
      
      if (!missionsByEmployee[employeeId]) {
        missionsByEmployee[employeeId] = {
          employee: mission.employee,
          missions: []
        };
      }
      
      missionsByEmployee[employeeId].missions.push(mission);
    });

    console.log(`👥 Nombre d'employés avec missions: ${Object.keys(missionsByEmployee).length}`);

    // Analyser chaque employé
    Object.keys(missionsByEmployee).forEach(employeeId => {
      const employeeData = missionsByEmployee[employeeId];
      const missions = employeeData.missions;
      
      if (missions.length > 1) {
        console.log(`\n👤 ${employeeData.employee.nom} ${employeeData.employee.prenom} (${employeeData.employee.matricule})`);
        console.log(`   🏢 Centre: ${employeeData.employee.centre || 'Non défini'}`);
        console.log(`   💼 Poste: ${employeeData.employee.poste || 'Non défini'}`);
        console.log(`   📋 Nombre de missions: ${missions.length}`);
        
        // Vérifier les doublons (même mois)
        const missionsByMonth = {};
        
        missions.forEach(mission => {
          const startDate = new Date(mission.startDate);
          const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
          
          if (!missionsByMonth[monthKey]) {
            missionsByMonth[monthKey] = [];
          }
          missionsByMonth[monthKey].push(mission);
        });

        // Identifier les conflits par mois
        Object.keys(missionsByMonth).forEach(monthKey => {
          const monthMissions = missionsByMonth[monthKey];
          
          if (monthMissions.length > 1) {
            const [year, month] = monthKey.split('-');
            const monthName = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            
            console.log(`   ⚠️  CONFLIT pour ${monthName}: ${monthMissions.length} missions`);
            
            monthMissions.forEach((mission, index) => {
              console.log(`      ${index + 1}. ${mission.code_mission} - ${new Date(mission.startDate).toLocaleDateString()} à ${new Date(mission.endDate).toLocaleDateString()} (${mission.status})`);
            });
            
            conflicts.push({
              employee: employeeData.employee,
              month: monthName,
              missions: monthMissions
            });
            
            // Considérer comme doublons si plus d'une mission par mois
            duplicates.push({
              employee: employeeData.employee,
              month: monthName,
              missions: monthMissions
            });
          } else {
            const mission = monthMissions[0];
            const [year, month] = monthKey.split('-');
            const monthName = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            console.log(`   ✅ ${monthName}: ${mission.code_mission} (${mission.status})`);
          }
        });
      } else {
        const mission = missions[0];
        const startDate = new Date(mission.startDate);
        const monthName = startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        console.log(`\n👤 ${employeeData.employee.nom} ${employeeData.employee.prenom} (${employeeData.employee.matricule})`);
        console.log(`   ✅ ${monthName}: ${mission.code_mission} (${mission.status})`);
      }
    });

    // Résumé des conflits
    console.log('\n📈 RÉSUMÉ DES CONFLITS');
    console.log('=======================');
    console.log(`🔴 Total des employés avec conflits: ${conflicts.length}`);
    console.log(`🔄 Total des doublons détectés: ${duplicates.length}`);

    if (conflicts.length > 0) {
      console.log('\n📋 DÉTAIL DES CONFLITS:');
      conflicts.forEach((conflict, index) => {
        console.log(`${index + 1}. ${conflict.employee.nom} ${conflict.employee.prenom} - ${conflict.month} (${conflict.missions.length} missions)`);
      });
    }

    // Statistiques par statut
    const statusStats = {};
    monthlyMissions.forEach(mission => {
      const status = mission.status || 'unknown';
      statusStats[status] = (statusStats[status] || 0) + 1;
    });

    console.log('\n📊 STATISTIQUES PAR STATUT');
    console.log('===========================');
    Object.keys(statusStats).forEach(status => {
      console.log(`${status}: ${statusStats[status]} missions`);
    });

    return {
      totalMissions: monthlyMissions.length,
      conflicts: conflicts,
      duplicates: duplicates,
      statusStats: statusStats
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
    throw error;
  }
};

// Fonction pour nettoyer les doublons
const cleanDuplicates = async (duplicates) => {
  console.log('\n🧹 NETTOYAGE DES DOUBLONS');
  console.log('==========================');

  if (duplicates.length === 0) {
    console.log('✅ Aucun doublon à nettoyer');
    return 0;
  }

  let cleanedCount = 0;

  for (const duplicate of duplicates) {
    console.log(`\n👤 Nettoyage pour ${duplicate.employee.nom} ${duplicate.employee.prenom} - ${duplicate.month}`);
    
    // Garder la mission la plus récente (créée en dernier) et supprimer les autres
    const sortedMissions = duplicate.missions.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    const missionToKeep = sortedMissions[0];
    const missionsToDelete = sortedMissions.slice(1);
    
    console.log(`   ✅ Garder: ${missionToKeep.code_mission} (créée le ${new Date(missionToKeep.createdAt).toLocaleDateString()})`);
    
    for (const mission of missionsToDelete) {
      console.log(`   🗑️  Supprimer: ${mission.code_mission} (créée le ${new Date(mission.createdAt).toLocaleDateString()})`);
      
      try {
        await Mission.findByIdAndDelete(mission._id);
        cleanedCount++;
      } catch (error) {
        console.error(`   ❌ Erreur lors de la suppression de ${mission.code_mission}:`, error.message);
      }
    }
  }

  console.log(`\n✅ Nettoyage terminé: ${cleanedCount} missions supprimées`);
  return cleanedCount;
};

// Fonction principale
const main = async () => {
  try {
    await connectDB();
    
    const analysis = await analyzeMonthlyMissions();
    
    console.log('\n📋 RECOMMANDATIONS:');
    console.log('===================');
    
    if (analysis.conflicts.length > 0) {
      console.log('🔴 Actions recommandées:');
      console.log('   1. Nettoyer les doublons automatiquement');
      console.log('   2. Vérifier manuellement les missions restantes');
      console.log('   3. Mettre à jour les règles de validation');
      
      if (analysis.duplicates.length > 0) {
        console.log(`\n🧹 ${analysis.duplicates.length} doublons détectés.`);
        
        if (process.argv.includes('--auto-clean')) {
          console.log('🔄 Début du nettoyage automatique...');
          await cleanDuplicates(analysis.duplicates);
        } else {
          console.log('💡 Pour nettoyer automatiquement, relancez avec: node checkMissionsDirect.js --auto-clean');
        }
      }
    } else {
      console.log('✅ Aucun conflit détecté. La base de données est propre.');
    }

    console.log('\n✅ Analyse terminée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = {
  analyzeMonthlyMissions,
  cleanDuplicates
}; 