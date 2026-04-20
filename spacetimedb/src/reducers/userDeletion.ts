import spacetimedb from '../schema';
import { UserDeletionJob, setRunUserDeletionReducer } from '../tables/userDeletionJob';
import { performUserDeletion } from '../helpers/userDeletionHelper';

// Scheduled reducer: cascades active-state data + soft-deletes (or hard-deletes guest) User.
// Fires ~5 seconds after admin initiates deletion.
// Guest users with no history references are hard-deleted; all others are soft-deleted
// with username='deleted_<id>', displayName preserved for history table FK integrity.
export const run_user_deletion = spacetimedb.reducer(
    { arg: UserDeletionJob.rowType },
    (ctx, { arg }) => {
        performUserDeletion(ctx, arg.userId, arg.createdById);
    }
);

// Wire the reducer into the scheduled table's lazy reference
setRunUserDeletionReducer(run_user_deletion);
