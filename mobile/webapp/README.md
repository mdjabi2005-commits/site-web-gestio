# Gestio V4 - Webapp (Mobile Target)

Cette partie de l'application est construite avec React et TypeScript, ciblant les appareils mobiles via **Capacitor**.

## 🚀 Commandes Mobiles (Priorité)

Pour tester sur un appareil Android ou un émulateur :

```bash
# 1. Build de l'application React
npm run build

# 2. Synchronisation avec le projet natif
npx cap sync

# 3. Lancer l'application (Succession de commandes)
npm run build
npx cap sync
npx cap run android

## 🛠️ Développement Natif (IDE)

Si tu n'utilises pas Android Studio, tu peux ouvrir le dossier `android/` directement avec **IntelliJ IDEA Ultimate**.
- Fichier > Ouvrir... > Sélectionner le dossier `vmobile\android`
- IntelliJ détectera automatiquement le projet Gradle.
```

## 🌐 Développement Web (Aperçu)

Pour une itération rapide sur l'UI :

```bash
npm run dev
```

> [!NOTE]
> Le démarrage de Python (Pyodide) prend environ 5 secondes. L'application utilise un **Startup Hybride** : les données sont chargées instantanément via SQL (JS) pendant que Python initialise ses modules en arrière-plan.
