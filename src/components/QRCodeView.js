// src/components/QRCodeView.js
//
// QR code dessiné en SVG (net à toutes les tailles), avec une marge
// blanche autour pour qu'il se scanne bien sur n'importe quel fond.

import QRCode from 'qrcode';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

const QUIET_ZONE = 2; // modules de marge (fond blanc)

export function QRCodeView({ value, size = 180, color = '#000000' }) {
  const qr = useMemo(() => {
    if (!value) return null;
    try {
      const { modules } = QRCode.create(value, { errorCorrectionLevel: 'M' });
      // Un carré par module foncé, regroupés dans un seul tracé
      let path = '';
      for (let y = 0; y < modules.size; y++) {
        for (let x = 0; x < modules.size; x++) {
          if (modules.get(y, x)) {
            path += `M${x + QUIET_ZONE} ${y + QUIET_ZONE}h1v1h-1z`;
          }
        }
      }
      return { path, viewSize: modules.size + QUIET_ZONE * 2 };
    } catch {
      return null;
    }
  }, [value]);

  if (!qr) return null;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${qr.viewSize} ${qr.viewSize}`}
        shapeRendering="crispEdges"
      >
        <Rect width={qr.viewSize} height={qr.viewSize} fill="#FFFFFF" />
        <Path d={qr.path} fill={color} />
      </Svg>
    </View>
  );
}

export default QRCodeView;

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
