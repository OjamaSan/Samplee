// src/components/ConfirmDialog.js
//
// Fenêtre de confirmation par-dessus l'écran (ex. "Quitter la partie ?").

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';
import { Button } from './Button';

/**
 * Props :
 *  - visible
 *  - title, message?
 *  - confirmLabel, cancelLabel?
 *  - onConfirm(), onCancel()
 *  - busy? : désactive les boutons pendant l'action
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  busy = false,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        {/* Toucher à côté = annuler */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.card}>
          <Text style={[theme.typography.headingSm, styles.title]}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.buttons}>
            <Button
              variant="light"
              tone="rouge"
              size="sm"
              title={cancelLabel}
              onPress={onCancel}
              disabled={busy}
              style={styles.button}
            />
            <Button
              variant="solid"
              tone="rouge"
              size="sm"
              title={confirmLabel}
              onPress={onConfirm}
              disabled={busy}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default ConfirmDialog;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.rouge[100],
    borderRadius: 20,
    padding: 24,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.25)',
  },
  title: {
    color: theme.colors.rouge[900],
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    ...theme.typography.bodyMd,
    color: theme.colors.rouge[700],
    textAlign: 'center',
    marginBottom: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
});
