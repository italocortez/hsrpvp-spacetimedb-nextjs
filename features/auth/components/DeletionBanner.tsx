'use client';

import React from 'react';
import { useAuthContext } from './AuthProvider';

export default function DeletionBanner() {
    const { isDeleted } = useAuthContext();
    if (!isDeleted) return null;
    return (
        <div style={{
            background: '#dc2626',
            color: 'white',
            textAlign: 'center',
            padding: '12px 16px',
            fontWeight: 600,
            fontSize: '14px',
            zIndex: 1000,
        }}>
            Your account has been deleted by an administrator. You will be logged out shortly.
        </div>
    );
}
