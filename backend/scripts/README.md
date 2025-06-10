# Scripts de Vérification et Nettoyage des Missions

Ce dossier contient des scripts pour analyser, vérifier et nettoyer la collection des missions mensuelles dans la base de données MongoDB.

## 📋 Scripts Disponibles

### 1. `checkMissions.js` - Analyse des Conflits
Script pour identifier et analyser les conflits dans les missions mensuelles.

**Utilisation :**
```bash
# Analyser sans nettoyer
node checkMissions.js

# Analyser et nettoyer automatiquement
node checkMissions.js --auto-clean
```

**Fonctionnalités :**
- ✅ Analyse des missions mensuelles par employé
- ✅ Détection des doublons par mois
- ✅ Identification des conflits
- ✅ Recommandations de nettoyage
- ✅ Nettoyage automatique optionnel

### 2. `missionsReport.js` - Rapport Détaillé
Script pour générer un rapport complet des missions avec statistiques.

**Utilisation :**
```bash
node missionsReport.js
```

**Fonctionnalités :**
- 📊 Statistiques globales des missions
- 👤 Analyse détaillée par employé
- 📅 Répartition des missions par mois
- 🏆 Top des employés avec le plus de missions
- 💡 Recommandations d'actions

### 3. `cleanDuplicates.js` - Nettoyage des Doublons
Script pour nettoyer automatiquement les doublons de missions.

**Utilisation :**
```bash
# Identifier les doublons sans nettoyer
node cleanDuplicates.js

# Nettoyer automatiquement
node cleanDuplicates.js --auto
```

**Fonctionnalités :**
- 💾 Création automatique de sauvegarde
- 🔍 Identification des doublons
- 🧹 Nettoyage automatique
- 📊 Rapport de nettoyage

## 🚀 Procédure Recommandée

### Étape 1 : Analyse Initiale
```bash
# Générer un rapport complet
node missionsReport.js
```

### Étape 2 : Vérification des Conflits
```bash
# Analyser les conflits spécifiques
node checkMissions.js
```

### Étape 3 : Nettoyage (si nécessaire)
```bash
# Nettoyer les doublons avec sauvegarde
node cleanDuplicates.js --auto
```

### Étape 4 : Vérification Post-Nettoyage
```bash
# Vérifier que le nettoyage a fonctionné
node missionsReport.js
```

## 📊 Types de Conflits Détectés

### 1. Doublons par Mois
- Plusieurs missions mensuelles pour le même employé dans le même mois
- **Solution :** Garder la mission la plus récente, supprimer les autres

### 2. Missions en Conflit
- Missions qui se chevauchent temporellement
- **Solution :** Analyse manuelle recommandée

### 3. Missions Orphelines
- Missions sans employé associé
- **Solution :** Suppression ou correction des références

## 🔧 Configuration

### Variables d'Environnement
```bash
# URL de connexion MongoDB
MONGODB_URI=mongodb://localhost:27017/missions_db
```

### Structure des Sauvegardes
```
backend/scripts/backups/
├── missions_backup_2024-01-15T10-30-00-000Z.json
├── missions_backup_2024-01-15T11-45-00-000Z.json
└── ...
```

## ⚠️ Précautions

### Avant le Nettoyage
1. ✅ Vérifier la sauvegarde automatique
2. ✅ Analyser le rapport de conflits
3. ✅ Confirmer les actions à effectuer

### Pendant le Nettoyage
1. 🔒 Ne pas interrompre le processus
2. 📝 Noter les actions effectuées
3. ⏱️ Attendre la fin du processus

### Après le Nettoyage
1. ✅ Vérifier le rapport post-nettoyage
2. ✅ Tester l'application
3. 💾 Conserver la sauvegarde

## 📈 Exemples de Sortie

### Rapport d'Analyse
```
📊 RAPPORT DÉTAILLÉ DES MISSIONS
==================================
👥 Total des employés actifs: 150
📋 Total des missions mensuelles: 89
✅ Employés avec missions: 67
❌ Employés sans missions: 83
🟢 Missions actives: 45
🔵 Missions complétées: 38
🔴 Missions annulées: 6
⚠️  Conflits détectés: 3
```

### Nettoyage
```
🧹 NETTOYAGE DES DOUBLONS
==========================
👤 Ahmed Benali - janvier 2024
   ✅ Garder: 00001/2024 (créée le 15/01/2024)
   🗑️  Supprimer: 00002/2024 (créée le 10/01/2024)

✅ Nettoyage terminé:
   🗑️  Missions supprimées: 5
   ✅ Missions conservées: 3
```

## 🆘 Dépannage

### Erreurs Courantes

**Connexion MongoDB échouée :**
```bash
# Vérifier l'URL de connexion
echo $MONGODB_URI
```

**Permissions insuffisantes :**
```bash
# Vérifier les droits d'écriture
ls -la backend/scripts/backups/
```

**Script interrompu :**
```bash
# Relancer avec la sauvegarde
node cleanDuplicates.js --auto
```

## 📞 Support

En cas de problème :
1. 📋 Consulter les logs d'erreur
2. 💾 Vérifier les sauvegardes
3. 🔄 Relancer l'analyse
4. 📧 Contacter l'équipe technique 