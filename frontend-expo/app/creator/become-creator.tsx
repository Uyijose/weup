import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import {
  router,
} from "expo-router";

import { supabase } from "../../lib/supabase";

import { useUploadVideoStore } from "../../stores/uploadVideoStore";

import { becomeCreatorStyles } from "../../styles/creator/becomeCreator.styles";

export default function BecomeCreatorScreen() {
  const [pageLoading, setPageLoading] = useState(true);

  const [creatorUsername, setCreatorUsername] =
    useState("");

  const [platformTitle, setPlatformTitle] =
    useState("");

  const [platformDescription, setPlatformDescription] =
    useState("");

  const [creatorAvatarFile, setCreatorAvatarFile] =
    useState<any>(null);

  const [creatorAvatarPreview, setCreatorAvatarPreview] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const { uploadImage } =
    useUploadVideoStore();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/(auth)/signin");
        return;
      }

      setPageLoading(false);
    };

    checkAuth();
  }, []);

  const pickCreatorAvatar = async () => {
    if (isSubmitting) {
      return;
    }

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to choose a creator profile image."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];

    setCreatorAvatarFile(asset);
    setCreatorAvatarPreview(asset.uri);
  };

  const handleConfirm = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert(
          "Authentication required",
          "You must be logged in to become a creator."
        );

        router.replace("/(auth)/signin");
        return;
      }

      if (
        !creatorUsername.trim() ||
        !platformTitle.trim() ||
        !platformDescription.trim()
      ) {
        Alert.alert(
          "Missing information",
          "All fields are required."
        );
        return;
      }

      const trimmedUsername =
        creatorUsername.trim();

      if (trimmedUsername.length > 20) {
        Alert.alert(
          "Invalid username",
          "Creator username cannot exceed 20 characters."
        );
        return;
      }

      const {
        data: existingRequest,
        error: fetchError,
      } = await supabase
        .from("creator_requests")
        .select("id, status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        Alert.alert(
          "Error",
          "Unable to verify creator request status."
        );
        return;
      }

      if (existingRequest) {
        if (
          existingRequest.status ===
          "pending"
        ) {
          Alert.alert(
            "Request pending",
            "You already submitted a creator request. It is still pending."
          );
          return;
        }

        if (
          existingRequest.status ===
          "rejected"
        ) {
          Alert.alert(
            "Request rejected",
            "Sorry, your previous creator request was rejected."
          );
          return;
        }

        if (
          existingRequest.status ===
          "approved"
        ) {
          Alert.alert(
            "Already a creator",
            "You are already an approved creator."
          );
          return;
        }
      }

      let creatorAvatarUrl: string | null = null;

        if (creatorAvatarFile) {
        creatorAvatarUrl = await uploadImage({
            uri: creatorAvatarFile.uri,
            fileName: creatorAvatarFile.fileName,
            mimeType: creatorAvatarFile.mimeType,
        });

        if (!creatorAvatarUrl) {
            Alert.alert(
            "Upload failed",
            "Unable to upload your creator profile image. Please try again."
            );
            return;
        }
      }

      const {
        error: insertError,
      } = await supabase
        .from("creator_requests")
        .insert({
          user_id: user.id,
          creator_username:
            trimmedUsername,
          platform_title:
            platformTitle.trim(),
          platform_description:
            platformDescription.trim(),
          creator_avatar_url:
            creatorAvatarUrl,
        });

      if (insertError) {
        Alert.alert(
          "Submission failed",
          insertError.message
        );
        return;
      }

      Alert.alert(
        "Creator request submitted",
        "Your creator request has been submitted. Please wait for admin approval.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace(
                `/user/${user.id}`
              ),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ||
          "Something went wrong while submitting your creator request."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      router.replace(`/user/${user.id}`);
      return;
    }

    router.replace("/");
  };

  if (pageLoading) {
    return (
      <SafeAreaView
        style={becomeCreatorStyles.container}
      >
        <View
          style={
            becomeCreatorStyles.loadingContainer
          }
        >
          <ActivityIndicator
            size="small"
            color="#6A00F4"
          />

          <Text
            style={
              becomeCreatorStyles.loadingText
            }
          >
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={becomeCreatorStyles.container}
    >
      <KeyboardAvoidingView
        style={
          becomeCreatorStyles.keyboardContainer
        }
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            becomeCreatorStyles.content
          }
        >
          <View
            style={
              becomeCreatorStyles.header
            }
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCancel}
              style={
                becomeCreatorStyles.backButton
              }
            >
              <Text
                style={
                  becomeCreatorStyles.backText
                }
              >
                ‹
              </Text>
            </TouchableOpacity>

            <Text
              style={
                becomeCreatorStyles.headerTitle
              }
            >
              Become a Creator
            </Text>

            <View
              style={
                becomeCreatorStyles.headerSpacer
              }
            />
          </View>

          <View
            style={
              becomeCreatorStyles.card
            }
          >
            <Text
              style={
                becomeCreatorStyles.title
              }
            >
              Create Your Creator Profile
            </Text>

            <Text
              style={
                becomeCreatorStyles.introText
              }
            >
              You need to input the following
              details to set up your creator
              profile. This information will
              represent your platform and brand.
            </Text>

            <View
              style={
                becomeCreatorStyles.formGroup
              }
            >
              <Text
                style={
                  becomeCreatorStyles.label
                }
              >
                Creator Profile Image
              </Text>

              <Text
                style={
                  becomeCreatorStyles.optionalText
                }
              >
                Optional
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={pickCreatorAvatar}
                style={
                  becomeCreatorStyles.avatarPicker
                }
              >
                {creatorAvatarPreview ? (
                  <Image
                    source={{
                      uri: creatorAvatarPreview,
                    }}
                    style={
                      becomeCreatorStyles.avatarPreview
                    }
                  />
                ) : (
                  <View
                    style={
                      becomeCreatorStyles.avatarPlaceholder
                    }
                  >
                    <Text
                      style={
                        becomeCreatorStyles.avatarPlaceholderText
                      }
                    >
                      +
                    </Text>

                    <Text
                      style={
                        becomeCreatorStyles.avatarPlaceholderLabel
                      }
                    >
                      Choose Image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {creatorAvatarPreview && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={pickCreatorAvatar}
                  style={
                    becomeCreatorStyles.changeImageButton
                  }
                >
                  <Text
                    style={
                      becomeCreatorStyles.changeImageText
                    }
                  >
                    Change Image
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View
              style={
                becomeCreatorStyles.formGroup
              }
            >
              <Text
                style={
                  becomeCreatorStyles.label
                }
              >
                Creator Username
              </Text>

              <Text
                style={
                  becomeCreatorStyles.helperText
                }
              >
                Maximum 20 characters
              </Text>

              <TextInput
                style={
                  becomeCreatorStyles.input
                }
                placeholder="Enter your creator username"
                placeholderTextColor="#999999"
                value={creatorUsername}
                autoCapitalize="none"
                onChangeText={(value) => {
                  const cleanedValue =
                    value.replace(
                      /\s+/g,
                      "_"
                    );

                  if (
                    cleanedValue.length >
                    20
                  ) {
                    Alert.alert(
                      "Username limit",
                      "Creator username cannot exceed 20 characters."
                    );
                    setCreatorUsername(
                      cleanedValue.slice(
                        0,
                        20
                      )
                    );
                    return;
                  }

                  setCreatorUsername(
                    cleanedValue
                  );
                }}
              />
            </View>

            <View
              style={
                becomeCreatorStyles.formGroup
              }
            >
              <Text
                style={
                  becomeCreatorStyles.label
                }
              >
                Your Platform Title
              </Text>

              <TextInput
                style={
                  becomeCreatorStyles.input
                }
                placeholder="Enter your platform title"
                placeholderTextColor="#999999"
                value={platformTitle}
                onChangeText={
                  setPlatformTitle
                }
              />
            </View>

            <View
              style={
                becomeCreatorStyles.formGroup
              }
            >
              <Text
                style={
                  becomeCreatorStyles.label
                }
              >
                Platform Description / Creator
                Description
              </Text>

              <TextInput
                style={
                  becomeCreatorStyles.textArea
                }
                placeholder="Describe your platform or what you create..."
                placeholderTextColor="#999999"
                value={
                  platformDescription
                }
                onChangeText={
                  setPlatformDescription
                }
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <View
              style={
                becomeCreatorStyles.actions
              }
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  handleConfirm
                }
                disabled={
                  isSubmitting
                }
                style={[
                  becomeCreatorStyles.confirmButton,
                  isSubmitting &&
                    becomeCreatorStyles.disabledButton,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      becomeCreatorStyles.confirmText
                    }
                  >
                    Confirm Profile Setup
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  handleCancel
                }
                disabled={
                  isSubmitting
                }
                style={
                  becomeCreatorStyles.cancelButton
                }
              >
                <Text
                  style={
                    becomeCreatorStyles.cancelText
                  }
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}