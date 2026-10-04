import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";

type Props = {
  children: React.ReactNode;
  visibleMenu: boolean;
  closeMenu: () => void;
};

const ModalWrapperComponent: React.FC<Props> = ({
  children,
  visibleMenu,
  closeMenu,
}) => {
  return (
    <Modal transparent visible={visibleMenu} animationType="fade">
      <Pressable style={styles.overlay} onPress={closeMenu}>
        <View style={styles.list}>{children}</View>
      </Pressable>
    </Modal>
  );
};

export default ModalWrapperComponent;

const styles = StyleSheet.create({
  list: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    maxHeight: 260,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});
