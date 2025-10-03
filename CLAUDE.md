# Documentation technique - Problèmes résolus

## Problème de scroll sur mobile (Octobre 2025)

### Symptômes
- Sur mobile, lors d'un swipe rapide vers le haut ou le bas, le scroll est bloqué avant d'atteindre le vrai haut/bas de la page
- L'utilisateur doit refaire un second scroll pour atteindre le vrai début/fin du contenu
- Donne l'impression d'un "mur invisible" qui limite artificiellement la hauteur de la page

### Cause identifiée
Dans `app/layout-with-nav.tsx`, l'utilisation de `h-screen` (hauteur fixe de 100vh) sur l'élément `<main>` combinée avec :
- `overflow-y-auto` pour créer une zone scrollable
- Un `padding-bottom` dynamique (`pb-20` ou `pb-72` selon l'état du bandeau de tutoriel)

Cette combinaison créait un décalage entre la hauteur fixe du conteneur et la hauteur réelle du contenu. Lors d'un swipe avec momentum/inertie, le navigateur mobile calculait mal la position finale du scroll.

### Solution appliquée
**Fichier modifié :** `app/layout-with-nav.tsx:28`

**Avant :**
```tsx
<main className={`h-screen overflow-y-auto ...`}>
```

**Après :**
```tsx
<main className={`min-h-screen md:h-screen overflow-y-auto ...`}>
```

**Explication :**
- Sur mobile : `min-h-screen` permet au conteneur de s'adapter à la hauteur réelle du contenu
- Sur desktop : `md:h-screen` conserve le comportement de hauteur fixe (nécessaire pour le layout avec sidebar)

### Notes importantes
- ⚠️ Ne jamais utiliser `h-screen` sur un conteneur scrollable sur mobile
- ⚠️ Toujours privilégier `min-h-screen` sur mobile quand le contenu a une hauteur variable
- ✅ Le bandeau de tutoriel continue de fonctionner correctement avec cette solution
- ✅ Le scroll est maintenant fluide et naturel sur mobile

### Comment tester
1. Ouvrir l'application sur un appareil mobile (ou simulateur mobile)
2. Faire un swipe rapide vers le bas sur une longue page
3. Vérifier que le scroll atteint bien le bas de la page sans blocage
4. Faire un swipe rapide vers le haut
5. Vérifier que le scroll atteint bien le haut de la page sans blocage
