const mongoose = require('mongoose');
const Mission = require('../models/Mission');
const Employee = require('../models/Employee');

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

// Fonction pour générer un rapport détaillé
const generateDetailedReport = async () => {
  console.log('\n📊 RAPPORT DÉTAILLÉ DES MISSIONS');
  console.log('==================================');

  try {
    // Récupérer tous les employés
    const employees = await Employee.find({ status: 'active' }).sort({ nom: 1, prenom: 1 });
    console.log(`👥 Total des employés actifs: ${employees.length}`);

    // Récupérer toutes les missions mensuelles
    const monthlyMissions = await Mission.find({ type: 'monthly' })
      .populate('employee', 'nom prenom matricule centre poste')
      .sort({ startDate: -1 });

    console.log(`📋 Total des missions mensuelles: ${monthlyMissions.length}`);

    // Statistiques globales
    const stats = {
      totalEmployees: employees.length,
      totalMissions: monthlyMissions.length,
      employeesWithMissions: 0,
      employeesWithoutMissions: 0,
      activeMissions: 0,
      completedMissions: 0,
      cancelledMissions: 0,
      conflicts: 0
    };

    // Grouper les missions par employé
    const missionsByEmployee = {};
    const conflicts = [];

    monthlyMissions.forEach(mission => {
      const employeeId = mission.employee._id.toString();
      
      if (!missionsByEmployee[employeeId]) {
        missionsByEmployee[employeeId] = {
          employee: mission.employee,
          missions: []
        };
      }
      
      missionsByEmployee[employeeId].missions.push(mission);
      
      // Compter par statut
      switch (mission.status) {
        case 'active':
          stats.activeMissions++;
          break;
        case 'completed':
          stats.completedMissions++;
          break;
        case 'cancelled':
          stats.cancelledMissions++;
          break;
      }
    });

    // Analyser chaque employé
    console.log('\n👤 ANALYSE PAR EMPLOYÉ');
    console.log('=======================');

    employees.forEach(employee => {
      const employeeMissions = missionsByEmployee[employee._id.toString()];
      const hasMissions = employeeMissions && employeeMissions.missions.length > 0;
      
      if (hasMissions) {
        stats.employeesWithMissions++;
        
        const missions = employeeMissions.missions;
        console.log(`\n👤 ${employee.nom} ${employee.prenom} (${employee.matricule})`);
        console.log(`   🏢 Centre: ${employee.centre || 'Non défini'}`);
        console.log(`   💼 Poste: ${employee.poste || 'Non défini'}`);
        console.log(`   📋 Missions: ${missions.length}`);
        
        // Vérifier les conflits par mois
        const missionsByMonth = {};
        
        missions.forEach(mission => {
          const startDate = new Date(mission.startDate);
          const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
          
          if (!missionsByMonth[monthKey]) {
            missionsByMonth[monthKey] = [];
          }
          missionsByMonth[monthKey].push(mission);
        });

        // Afficher les missions par mois
        Object.keys(missionsByMonth).forEach(monthKey => {
          const monthMissions = missionsByMonth[monthKey];
          const [year, month] = monthKey.split('-');
          const monthName = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
          
          if (monthMissions.length > 1) {
            console.log(`   ⚠️  ${monthName}: ${monthMissions.length} missions (CONFLIT!)`);
            stats.conflicts++;
            conflicts.push({
              employee: employee,
              month: monthName,
              missions: monthMissions
            });
          } else {
            const mission = monthMissions[0];
            console.log(`   ✅ ${monthName}: ${mission.code_mission} (${mission.status})`);
          }
        });
        
      } else {
        stats.employeesWithoutMissions++;
        console.log(`\n👤 ${employee.nom} ${employee.prenom} (${employee.matricule}) - Aucune mission`);
      }
    });

    // Statistiques détaillées
    console.log('\n📈 STATISTIQUES DÉTAILLÉES');
    console.log('============================');
    console.log(`👥 Employés actifs: ${stats.totalEmployees}`);
    console.log(`📋 Missions mensuelles: ${stats.totalMissions}`);
    console.log(`✅ Employés avec missions: ${stats.employeesWithMissions}`);
    console.log(`❌ Employés sans missions: ${stats.employeesWithoutMissions}`);
    console.log(`🟢 Missions actives: ${stats.activeMissions}`);
    console.log(`🔵 Missions complétées: ${stats.completedMissions}`);
    console.log(`🔴 Missions annulées: ${stats.cancelledMissions}`);
    console.log(`⚠️  Conflits détectés: ${stats.conflicts}`);

    // Top des employés avec le plus de missions
    console.log('\n🏆 TOP 10 EMPLOYÉS AVEC LE PLUS DE MISSIONS');
    console.log('=============================================');
    
    const employeesWithMissions = Object.values(missionsByEmployee)
      .sort((a, b) => b.missions.length - a.missions.length)
      .slice(0, 10);

    employeesWithMissions.forEach((employeeData, index) => {
      console.log(`${index + 1}. ${employeeData.employee.nom} ${employeeData.employee.prenom} - ${employeeData.missions.length} missions`);
    });

    // Missions par mois
    console.log('\n📅 MISSIONS PAR MOIS');
    console.log('=====================');
    
    const missionsByMonth = {};
    monthlyMissions.forEach(mission => {
      const startDate = new Date(mission.startDate);
      const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!missionsByMonth[monthKey]) {
        missionsByMonth[monthKey] = 0;
      }
      missionsByMonth[monthKey]++;
    });

    Object.keys(missionsByMonth)
      .sort()
      .forEach(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthName = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        console.log(`${monthName}: ${missionsByMonth[monthKey]} missions`);
      });

    // Recommandations
    console.log('\n💡 RECOMMANDATIONS');
    console.log('==================');
    
    if (stats.conflicts > 0) {
      console.log('🔴 Actions urgentes:');
      console.log(`   1. Nettoyer ${stats.conflicts} conflits détectés`);
      console.log('   2. Vérifier les doublons dans la base de données');
      console.log('   3. Renforcer la validation côté serveur');
    }
    
    if (stats.employeesWithoutMissions > 0) {
      console.log('🟡 Actions recommandées:');
      console.log(`   1. ${stats.employeesWithoutMissions} employés n'ont jamais eu de mission`);
      console.log('   2. Vérifier si ces employés sont bien actifs');
    }
    
    if (stats.cancelledMissions > 0) {
      console.log('🟠 Observations:');
      console.log(`   1. ${stats.cancelledMissions} missions annulées`);
      console.log('   2. Analyser les raisons des annulations');
    }

    return {
      stats,
      conflicts,
      employeesWithMissions
    };

  } catch (error) {
    console.error('❌ Erreur lors de la génération du rapport:', error);
    throw error;
  }
};

// Fonction principale
const main = async () => {
  try {
    await connectDB();
    await generateDetailedReport();
    
    console.log('\n✅ Rapport terminé');
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
  generateDetailedReport
}; 