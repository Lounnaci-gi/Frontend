# Validation des Missions Mensuelles

## Règle Métier

**Un employé ne peut avoir qu'une seule mission mensuelle par mois.**

## Implémentation

### Backend

#### 1. Validation au niveau du modèle (MongoDB)

**Fichier :** `backend/models/Mission.js`

- Ajout d'un middleware `pre('save')` qui vérifie les missions mensuelles existantes
- Vérification des chevauchements de dates pour le même employé
- Messages d'erreur en français avec le nom du mois

#### 2. Validation au niveau des routes

**Fichier :** `backend/routes/missions.js`

- **Route POST `/missions`** : Validation avant création d'une mission individuelle
- **Route POST `/missions/group`** : Validation avant création de missions groupées
- Gestion des erreurs avec codes spécifiques (`MONTHLY_MISSION_EXISTS`)

### Frontend

#### 1. Formulaire de mission individuelle

**Fichier :** `src/components/missions/MissionForm.js`

- Fonction `checkExistingMonthlyMission()` pour vérifier les missions existantes
- Validation en temps réel lors du changement d'employé ou de mois
- Affichage des erreurs dans l'interface utilisateur

#### 2. Création de missions groupées

**Fichier :** `src/components/missions/Missions.js`

- Fonction `checkEmployeeMonthlyMission()` pour vérifier les missions par employé
- Validation lors de la sélection d'employés
- Gestion de la sélection multiple avec exclusion des employés ayant déjà une mission
- Utilisation de la route `/missions/group` pour une validation optimisée

## Logique de Validation

### Critères de chevauchement

Une mission mensuelle est considérée comme conflictuelle si :

1. **Début dans le mois** : `startDate >= début_du_mois && startDate <= fin_du_mois`
2. **Fin dans le mois** : `endDate >= début_du_mois && endDate <= fin_du_mois`
3. **Couvre tout le mois** : `startDate <= début_du_mois && endDate >= fin_du_mois`

### Statuts considérés

Seules les missions avec les statuts suivants sont prises en compte :
- `active` (actives)
- `completed` (complétées)

Les missions `cancelled` (annulées) ne sont pas considérées comme conflictuelles.

## Messages d'Erreur

### Français
- Mission individuelle : `"L'employé a déjà une mission mensuelle pour [mois année]"`
- Missions groupées : `"Les employés suivants ont déjà une mission mensuelle pour [mois année]: [noms des employés]"`

### Arabe
- Messages d'erreur génériques pour l'interface utilisateur

## Avantages

1. **Prévention des doublons** : Empêche la création de missions en conflit
2. **Validation en temps réel** : Feedback immédiat à l'utilisateur
3. **Gestion des erreurs** : Messages clairs et informatifs
4. **Performance** : Validation côté serveur et client
5. **Flexibilité** : Permet la modification de missions existantes

## Tests Recommandés

1. Tenter de créer une mission mensuelle pour un employé qui en a déjà une
2. Tenter de créer des missions groupées avec des employés ayant des missions existantes
3. Vérifier que la modification d'une mission existante fonctionne
4. Tester avec différents mois et années
5. Vérifier que les missions annulées ne bloquent pas la création 