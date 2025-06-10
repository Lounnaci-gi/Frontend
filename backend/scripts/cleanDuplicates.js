const mongoose = require('mongoose');
const Mission = require('../models/Mission');

// Configuration de la connexion MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/missions_db');
    console.log('✅ Connexion à MongoDB établie');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
};

// Fonction pour identifier les doublons
const identifyDuplicates = async () => {
  console.log('\n🔍 IDENTIFICATION DES DOUBLONS');
  console.log('===============================');

  try {
    const monthlyMissions = await Mission.find({ type: 'monthly' })
      .populate('employee', 'nom prenom matricule')
      .sort({ startDate: 1 });

    const duplicates = [];
    const missionsByEmployee = {};

    // Grouper par employé
    monthlyMissions.forEach(mission => {
      const employeeId = mission.employee._id.toString();
      
      if (!missionsByEmployee[employeeId]) {
        missionsByEmployee[employeeId] = [];
      }
      
      missionsByEmployee[employeeId].push(mission);
    });

    // Identifier les doublons par mois
    Object.keys(missionsByEmployee).forEach(employeeId => {
      const missions = missionsByEmployee[employeeId];
      
      if (missions.length > 1) {
        const missionsByMonth = {};
        
        missions.forEach(mission => {
          const startDate = new Date(mission.startDate);
          const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
          
          if (!missionsByMonth[monthKey]) {
            missionsByMonth[monthKey] = [];
          }
          missionsByMonth[monthKey].push(mission);
        });

        Object.keys(missionsByMonth).forEach(monthKey => {
          const monthMissions = missionsByMonth[monthKey];
          
          if (monthMissions.length > 1) {
            const [year, month] = monthKey.split('-');
            const monthName = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            
            duplicates.push({
              employee: missions[0].employee,
              month: monthName,
              missions: monthMissions
            });
          }
        });
      }
    });

    console.log(`📊 ${duplicates.length} doublons identifiés`);
    return duplicates;

  } catch (error) {
    console.error('❌ Erreur lors de l\'identification des doublons:', error);
    throw error;
  }
};

// Fonction pour nettoyer les doublons
const cleanDuplicates = async (duplicates) => {
  console.log('\n🧹 NETTOYAGE DES DOUBLONS');
  console.log('==========================');

  if (duplicates.length === 0) {
    console.log('✅ Aucun doublon à nettoyer');
    return { cleaned: 0, kept: 0 };
  }

  let cleanedCount = 0;
  let keptCount = 0;

  for (const duplicate of duplicates) {
    console.log(`\n👤 ${duplicate.employee.nom} ${duplicate.employee.prenom} - ${duplicate.month}`);
    
    // Trier les missions par date de création (plus récente en premier)
    const sortedMissions = duplicate.missions.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    const missionToKeep = sortedMissions[0];
    const missionsToDelete = sortedMissions.slice(1);
    
    console.log(`   ✅ Garder: ${missionToKeep.code_mission} (créée le ${new Date(missionToKeep.createdAt).toLocaleDateString()})`);
    keptCount++;
    
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

  console.log(`\n✅ Nettoyage terminé:`);
  console.log(`   🗑️  Missions supprimées: ${cleanedCount}`);
  console.log(`   ✅ Missions conservées: ${keptCount}`);
  
  return { cleaned: cleanedCount, kept: keptCount };
};

// Fonction pour créer une sauvegarde avant nettoyage
const createBackup = async () => {
  console.log('\n💾 CRÉATION D\'UNE SAUVEGARDE');
  console.log('=============================');

  try {
    const monthlyMissions = await Mission.find({ type: 'monthly' });
    
    // Créer un fichier de sauvegarde avec timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData = {
      timestamp: new Date().toISOString(),
      totalMissions: monthlyMissions.length,
      missions: monthlyMissions.map(mission => ({
        _id: mission._id,
        code_mission: mission.code_mission,
        employee: mission.employee,
        startDate: mission.startDate,
        endDate: mission.endDate,
        status: mission.status,
        createdAt: mission.createdAt,
        updatedAt: mission.updatedAt
      }))
    };

    const fs = require('fs');
    const path = require('path');
    const backupDir = path.join(__dirname, 'backups');
    
    // Créer le dossier de sauvegarde s'il n'existe pas
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(backupDir, `missions_backup_${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Sauvegarde créée: ${backupFile}`);
    return backupFile;

  } catch (error) {
    console.error('❌ Erreur lors de la création de la sauvegarde:', error);
    throw error;
  }
};

// Fonction principale
const main = async () => {
  try {
    await connectDB();
    
    // Créer une sauvegarde avant nettoyage
    const backupFile = await createBackup();
    
    // Identifier les doublons
    const duplicates = await identifyDuplicates();
    
    if (duplicates.length === 0) {
      console.log('\n✅ Aucun doublon détecté. Base de données propre.');
      process.exit(0);
    }
    
    // Demander confirmation si pas en mode automatique
    if (!process.argv.includes('--auto')) {
      console.log(`\n⚠️  ${duplicates.length} doublons détectés.`);
      console.log('💡 Pour nettoyer automatiquement, relancez avec: node cleanDuplicates.js --auto');
      console.log('💾 Sauvegarde créée:', backupFile);
      process.exit(0);
    }
    
    // Nettoyer les doublons
    const result = await cleanDuplicates(duplicates);
    
    console.log('\n📊 RÉSUMÉ FINAL');
    console.log('=================');
    console.log(`🗑️  Missions supprimées: ${result.cleaned}`);
    console.log(`✅ Missions conservées: ${result.kept}`);
    console.log(`💾 Sauvegarde: ${backupFile}`);
    
    console.log('\n✅ Nettoyage terminé avec succès');
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
  identifyDuplicates,
  cleanDuplicates,
  createBackup
}; 