import { table, t } from 'spacetimedb/server';

export const userAchievementColumns = {
    id: t.u32().primaryKey().autoInc(),
    userId: t.u32(),
    achievementId: t.u32(),
    awardedById: t.u32(),
    isDisplayed: t.bool(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const UserAchievement = table({
    name: 'user_achievement',
    public: true,
    indexes: [
        { accessor: 'user_id', algorithm: 'btree', columns: ['userId'] },
        { accessor: 'achievement_id', algorithm: 'btree', columns: ['achievementId'] },
    ],
}, userAchievementColumns);
