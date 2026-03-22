import { table, t } from 'spacetimedb/server';
import { AchievementTriggerType, AchievementRarity } from '../types/enums';
export const achievementColumns = {
    id: t.u32().primaryKey().autoInc(),
    name: t.string().unique(),
    description: t.string(),
    triggerType: AchievementTriggerType,
    rarity: AchievementRarity,
    isOneTime: t.bool(),
    thresholdValue: t.u32().optional(),
    characterName: t.string().optional(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
export const Achievement = table({
    name: 'achievement',
    public: true,
}, achievementColumns);
