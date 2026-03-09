import spacetimedb from '../schema';
import { UserDeletionJob, setRunUserDeletionReducer } from '../tables/userDeletionJob';

// Scheduled reducer: hard-deletes a soft-deleted User + cascades UserIdentity rows.
// Fires ~5 seconds after admin initiates deletion.
export const run_user_deletion = spacetimedb.reducer(
    { arg: UserDeletionJob.rowType },
    (ctx, { arg }) => {
        const user = ctx.db.User.id.find(arg.userId);
        if (!user) return; // Already gone

        // Cascade: delete all UserIdentity rows for this user
        const identitiesToDelete: any[] = [];
        for (const ui of ctx.db.UserIdentity.iter()) {
            if (ui.userId === arg.userId) {
                identitiesToDelete.push(ui.identity);
            }
        }
        for (const identity of identitiesToDelete) {
            ctx.db.UserIdentity.identity.delete(identity);
        }

        // Hard-delete the user
        ctx.db.User.id.delete(arg.userId);
        console.log(`[ADMIN] Scheduled hard-delete completed for user #${arg.userId}`);
    }
);

// Wire the reducer into the scheduled table's lazy reference
setRunUserDeletionReducer(run_user_deletion);
