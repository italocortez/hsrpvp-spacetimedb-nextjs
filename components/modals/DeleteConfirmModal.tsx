'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    tableName: string;
    rowLabel: string;
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    tableName,
    rowLabel,
}: DeleteConfirmModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" size="sm">
            <ModalContent>
                <ModalHeader>Confirm Delete</ModalHeader>
                <ModalBody>
                    <p>
                        Delete row from <strong>{tableName}</strong>?
                    </p>
                    <p className="text-sm text-default-400">{rowLabel}</p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="flat" onPress={onClose}>
                        Cancel
                    </Button>
                    <Button color="danger" onPress={onConfirm}>
                        Delete
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
