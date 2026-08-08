import React, { useEffect, useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { supabase } from "../../lib/supabase";

import { becomeCreatorModalStyles } from "../../styles/creator/becomeCreatorModal.styles";

type BecomeCreatorModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function BecomeCreatorModal({
  visible,
  onClose,
}: BecomeCreatorModalProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const getUser = async () => {
      const {
        data: { user: sessionUser },
      } = await supabase.auth.getUser();

      setUser(sessionUser ?? null);
    };

    getUser();
  }, [visible]);

  const handleBecomeCreator = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    onClose();

    if (user) {
      router.push("/creator/become-creator");
      setLoading(false);
      return;
    }

    setLoading(false);

    router.replace("/(auth)/signin");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={becomeCreatorModalStyles.overlay}>
        <View style={becomeCreatorModalStyles.modal}>
          <Text style={becomeCreatorModalStyles.title}>
            Become a Creator
          </Text>

          <Text style={becomeCreatorModalStyles.description}>
            You need a creator account to upload videos and grow your
            audience.
          </Text>

          <View style={becomeCreatorModalStyles.actions}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={becomeCreatorModalStyles.secondaryButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={becomeCreatorModalStyles.secondaryText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={becomeCreatorModalStyles.primaryButton}
              onPress={handleBecomeCreator}
              disabled={loading}
            >
              <Text style={becomeCreatorModalStyles.primaryText}>
                Become a Creator
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}