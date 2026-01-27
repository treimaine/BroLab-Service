// Platform Core: Tenancy Module Exports

export {
    WorkspaceProvider,
    useWorkspace,
    type Workspace,
    type WorkspaceContextType
} from './WorkspaceContext';
export { WorkspaceErrorBoundary } from './WorkspaceErrorBoundary';
export { normalizeHostname, resolveTenancy } from './edge-router';

