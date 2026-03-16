import spacetimedb from '../schema';
import { UserDeletionJob, setRunUserDeletionReducer } from '../tables/userDeletionJob';

// Scheduled reducer: hard-deletes a soft-deleted User + cascades UserIdentity rows.
// Fires ~5 seconds after admin initiates deletion.
export const run_user_deletion = spacetimedb.reducer(
    { arg: UserDeletionJob.rowType },
    (ctx, { arg }) => {
        const user = ctx.db.User.id.find(arg.userId);
        if (!user) return; // Already gone

        // Cascade: delete all UserIdentity rows for this user (use btree index)
        const identities = [...ctx.db.UserIdentity.user_identity_user_id.filter(arg.userId)];
        for (const ui of identities) {
            ctx.db.UserIdentity.identity.delete(ui.identity);
        }

        // Cascade: delete all HSR accounts and their characters for this user
        const hsrAccounts = [...ctx.db.HsrAccount.hsr_account_user_id.filter(arg.userId)];
        for (const account of hsrAccounts) {
            // Delete all characters owned by this account
            const characters = [...ctx.db.HsrAccountCharacter.hsr_acc_char_account_id.filter(account.id)];
            for (const char of characters) {
                ctx.db.HsrAccountCharacter.delete(char);
            }
            // Delete the account itself
            ctx.db.HsrAccount.id.delete(account.id);
        }

        // Hard-delete the user
        ctx.db.User.id.delete(arg.userId);
        console.log(`[ADMIN] Scheduled hard-delete completed for user #${arg.userId}`);
    }
);

// Wire the reducer into the scheduled table's lazy reference
setRunUserDeletionReducer(run_user_deletion);
