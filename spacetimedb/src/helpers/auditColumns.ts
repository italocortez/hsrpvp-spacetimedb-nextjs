/** System user ID sentinel — used for bootstrap and scheduled operations. */
export const SYSTEM_USER_ID = 0;

/**
 * Returns audit field values for a new row INSERT.
 * Both "created" and "lastModified" point to the same actor and timestamp.
 */
export function auditInsert(ctx: any, userId: number = SYSTEM_USER_ID) {
    return {
        createdById: userId,
        createdDate: ctx.timestamp,
        lastModifiedById: userId,
        lastModifiedDate: ctx.timestamp,
    };
}

/**
 * Returns audit field values for an UPDATE (preserves original created* fields).
 * Caller must spread the existing row first, then spread this on top.
 */
export function auditUpdate(ctx: any, existing: any, userId: number = SYSTEM_USER_ID) {
    return {
        createdById: existing.createdById,
        createdDate: existing.createdDate,
        lastModifiedById: userId,
        lastModifiedDate: ctx.timestamp,
    };
}
