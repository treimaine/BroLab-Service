# Branded Types pour Convex IDs

## Qu'est-ce qu'un Branded Type ?

Un **branded type** est un pattern TypeScript qui ajoute une "marque" invisible à un type primitif pour créer une vraie sécurité de type.

```typescript
// ❌ Type alias simple - PAS de type safety
type UserId = string;
type ProductId = string;

const userId: UserId = "user123";
const productId: ProductId = userId; // ✅ Accepté par TypeScript (mais logiquement incorrect!)

// ✅ Branded type - VRAIE type safety
type UserId = string & { readonly __brand: 'User' };
type ProductId = string & { readonly __brand: 'Product' };

const userId: UserId = "user123" as UserId;
const productId: ProductId = userId; // ❌ ERREUR TypeScript !
```

## Implémentation dans le Worker

### Types définis

```typescript
type ConvexId<T extends string = string> = string & { readonly __brand: T };

type TrackId = ConvexId<'Track'>;
type StorageId = ConvexId<'Storage'>;
type JobId = ConvexId<'Job'>;
type WorkspaceId = ConvexId<'Workspace'>;
```

### Helper function

```typescript
function asConvexId<T extends string = string>(id: string): ConvexId<T> {
  return id as ConvexId<T>;
}
```

### Utilisation

```typescript
// Quand on reçoit des données de Convex (string brut)
const rawJobId = "j_abc123";

// On le convertit en branded type
const jobId: JobId = asConvexId<'Job'>(rawJobId);

// Maintenant TypeScript empêche les erreurs
const trackId: TrackId = jobId; // ❌ ERREUR : JobId n'est pas assignable à TrackId
```

## Avantages

1. **Type Safety** : Empêche d'assigner un ID d'un type à un autre
2. **Documentation** : Le code est auto-documenté (on sait qu'un `TrackId` est un ID de track)
3. **Refactoring** : Si on change la structure, TypeScript détecte les erreurs
4. **Pas de runtime overhead** : Les branded types sont effacés à la compilation

## Exemple concret dans le worker

```typescript
interface Job {
  _id: JobId;              // ✅ Clair : c'est un ID de job
  workspaceId: WorkspaceId; // ✅ Clair : c'est un ID de workspace
  payload: {
    trackId: TrackId;      // ✅ Clair : c'est un ID de track
    fullStorageId: StorageId; // ✅ Clair : c'est un ID de storage
  };
}

// Conversion depuis les données Convex
const typedJob: Job = {
  ...rawJobData,
  _id: asConvexId<'Job'>(rawJobData._id),
  workspaceId: asConvexId<'Workspace'>(rawJobData.workspaceId),
  payload: {
    trackId: asConvexId<'Track'>(rawJobData.payload.trackId),
    fullStorageId: asConvexId<'Storage'>(rawJobData.payload.fullStorageId),
  },
};
```

## Quand utiliser `asConvexId` ?

- ✅ Quand on reçoit des IDs depuis Convex (queries, mutations)
- ✅ Quand on parse des données JSON
- ✅ Aux frontières du système (API, DB)

## Quand NE PAS utiliser ?

- ❌ À l'intérieur du code qui manipule déjà des branded types
- ❌ Pour des strings qui ne sont pas des IDs

## Ressources

- [TypeScript Handbook - Branded Types](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [Branded Types in TypeScript](https://egghead.io/blog/using-branded-types-in-typescript)
