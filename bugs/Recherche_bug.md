Voici les requêtes MongoDB à lancer dans **mongosh** pour auditer ça.

## 1. Voir tous les tags distincts en base

```javascript
// Tous les tags utilisés dans les photos
db.photos.distinct("tags")
```

## 2. Vérifier les photos sans userId

```javascript
// Photos qui n'ont pas de userId (anciennes versions ?)
db.photos.find({ userId: { $exists: false } }).count()

// Voir un échantillon
db.photos.find({ userId: { $exists: false } }).limit(5)
```

## 3. Vérifier les albums sans userId

```javascript
// Albums sans userId
db.albums.find({ userId: { $exists: false } }).count()

// Albums orphelins (userId présent mais user inexistant)
db.albums.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  },
  { $match: { user: { $size: 0 } } },
  { $project: { title: 1, userId: 1 } }
])
```

## 4. Photos orphelines (album supprimé)

```javascript
// Photos dont l'albumId ne correspond à aucun album existant
db.photos.aggregate([
  {
    $lookup: {
      from: "albums",
      localField: "albumId",
      foreignField: "_id",
      as: "album"
    }
  },
  { $match: { album: { $size: 0 } } },
  { $count: "photosOrphelines" }
])
```

## 5. Tags utilisés dans des photos orphelines

```javascript
// Tags présents sur des photos sans user valide
db.photos.aggregate([
  { $match: { userId: { $exists: false } } },
  { $unwind: "$tags" },
  { $group: { _id: "$tags", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

## 6. Rapport global rapide

```javascript
// Vue d'ensemble en une commande
db.photos.aggregate([
  {
    $group: {
      _id: "$userId",
      count: { $sum: 1 },
      tags: { $addToSet: "$tags" }
    }
  },
  { $sort: { count: -1 } }
])
```

***

## Comment accéder à mongosh dans Docker

```bash
# Entrer dans le container MongoDB
docker exec -it <nom_container_mongo> mongosh

# Sélectionner ta base
use luminaview
```

Lance d'abord les requêtes **2 et 3** — si elles retournent `0`, ta base est propre. Si tu trouves des orphelins, je t'aide à écrire le script de nettoyage.
