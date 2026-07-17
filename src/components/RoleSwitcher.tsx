import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, Platform } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserRoles } from '@/hooks/useUserRoles';
import { MaterialIcons } from '@expo/vector-icons';
import { AppMode } from '@/types';

type RoleSwitcherProps = {
  showModeText?: boolean;
  compact?: boolean;
};

export const RoleSwitcher = ({ showModeText = true, compact = false }: RoleSwitcherProps) => {
  const theme = useAppTheme();
  const { 
    currentMode, 
    setCurrentMode, 
    canSwitchToAdmin, 
    adminSocieties,
    selectedAdminSocietyId,
    setSelectedAdminSocietyId,
    canSwitchToUnionAdmin,
    unionAdminRelationships,
    selectedUniversityId,
    setSelectedUniversityId
  } = useUserRoles();
  const [modalVisible, setModalVisible] = useState(false);

  const handleModeSwitch = () => {
    if (!canSwitchToAdmin) return;
    setModalVisible(true);
  };

  const selectMode = async (mode: AppMode) => {
    setModalVisible(false);
    await setCurrentMode(mode);
    
    // Auto-select first admin society when switching to admin mode
    if (mode === 'Admin' && !selectedAdminSocietyId && adminSocieties.length > 0) {
      setSelectedAdminSocietyId(adminSocieties[0].societyId);
    }
  };

  const selectAdminSociety = async (societyId: string) => {
    setSelectedAdminSocietyId(societyId);
    setModalVisible(false);
    await setCurrentMode('Admin');
  };

  const selectUnionAdmin = async (universityId: string) => {
    setSelectedUniversityId(universityId);
    setModalVisible(false);
    await setCurrentMode('UnionAdmin');
  };

  const selectedSociety = adminSocieties.find(s => s.societyId === selectedAdminSocietyId);

  if (!canSwitchToAdmin && !canSwitchToUnionAdmin) {
    return null; // Don't show switcher if user can't switch
  }

  return (
    <>
      <Pressable
        style={[
          styles.switcher,
          compact && styles.switcherCompact,
          { borderColor: theme.colors.border }
        ]}
        onPress={handleModeSwitch}
      >
        <View style={styles.switcherContent}>
          <MaterialIcons
            name={currentMode === 'Consumer' ? 'person' : 'admin-panel-settings'}
            size={compact ? 16 : 20}
            color={theme.colors.textPrimary}
          />
          {showModeText && (
            <View style={styles.modeInfo}>
          <Text style={[styles.modeText, { color: theme.colors.textPrimary }]}>
            {currentMode === 'Consumer' ? 'Student' : 
             currentMode === 'Admin' ? 'Society Admin' : 'Union Admin'}
          </Text>
          {currentMode === 'Admin' && selectedSociety && (
            <Text style={[styles.societyText, { color: theme.colors.textSecondary }]}>
              {selectedSociety.societyName}
            </Text>
          )}
          {currentMode === 'UnionAdmin' && unionAdminRelationships.length > 0 && (
            <Text style={[styles.societyText, { color: theme.colors.textSecondary }]}>
              {unionAdminRelationships.find(u => u.universityId === selectedUniversityId)?.universityName}
            </Text>
          )}
            </View>
          )}
          <MaterialIcons
            name="expand-more"
            size={16}
            color={theme.colors.textSecondary}
          />
        </View>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Switch Mode
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* Consumer Mode */}
              <Pressable
                style={[
                  styles.modeOption,
                  currentMode === 'Consumer' && { backgroundColor: theme.colors.background },
                  { borderBottomColor: theme.colors.border }
                ]}
                onPress={() => selectMode('Consumer')}
              >
                <View style={styles.modeOptionContent}>
                  <View style={styles.modeOptionIcon}>
                    <MaterialIcons name="person" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.modeOptionText}>
                    <Text style={[styles.modeOptionTitle, { color: theme.colors.textPrimary }]}>
                      Student Mode
                    </Text>
                    <Text style={[styles.modeOptionDescription, { color: theme.colors.textSecondary }]}>
                      Discover events, join societies, and engage with content
                    </Text>
                  </View>
                  {currentMode === 'Consumer' && (
                    <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                  )}
                </View>
              </Pressable>

              {/* Society Admin Modes */}
              {canSwitchToAdmin && (
                <>
                  <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
                    Society Administration
                  </Text>
                  
                  {adminSocieties.map((society) => (
                    <Pressable
                      key={society.societyId}
                      style={[
                        styles.modeOption,
                        currentMode === 'Admin' && selectedAdminSocietyId === society.societyId && 
                          { backgroundColor: theme.colors.background },
                      ]}
                      onPress={() => selectAdminSociety(society.societyId)}
                    >
                      <View style={styles.modeOptionContent}>
                        <View style={styles.modeOptionIcon}>
                          <MaterialIcons name="admin-panel-settings" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.modeOptionText}>
                          <Text style={[styles.modeOptionTitle, { color: theme.colors.textPrimary }]}>
                            {society.societyName}
                          </Text>
                          <Text style={[styles.modeOptionDescription, { color: theme.colors.textSecondary }]}>
                            {society.role} • Manage events, posts, and members
                          </Text>
                        </View>
                        {currentMode === 'Admin' && selectedAdminSocietyId === society.societyId && (
                          <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                        )}
                      </View>
                    </Pressable>
                  ))}
                </>
              )}

              {/* Union Admin Modes */}
              {canSwitchToUnionAdmin && (
                <>
                  <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
                    Union Administration
                  </Text>
                  
                  {unionAdminRelationships.map((university) => (
                    <Pressable
                      key={university.universityId}
                      style={[
                        styles.modeOption,
                        currentMode === 'UnionAdmin' && selectedUniversityId === university.universityId && 
                          { backgroundColor: theme.colors.background },
                      ]}
                      onPress={() => selectUnionAdmin(university.universityId)}
                    >
                      <View style={styles.modeOptionContent}>
                        <View style={styles.modeOptionIcon}>
                          <MaterialIcons name="school" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.modeOptionText}>
                          <Text style={[styles.modeOptionTitle, { color: theme.colors.textPrimary }]}>
                            {university.universityName}
                          </Text>
                          <Text style={[styles.modeOptionDescription, { color: theme.colors.textSecondary }]}>
                            {university.role} • Manage committee approvals and university settings
                          </Text>
                        </View>
                        {currentMode === 'UnionAdmin' && selectedUniversityId === university.universityId && (
                          <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                        )}
                      </View>
                    </Pressable>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  switcher: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
  switcherCompact: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 80,
  },
  switcherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeInfo: {
    flex: 1,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  societyText: {
    fontSize: 12,
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    maxHeight: 400,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  modeOption: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  modeOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeOptionText: {
    flex: 1,
  },
  modeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modeOptionDescription: {
    fontSize: 14,
    marginTop: 2,
    lineHeight: 18,
  },
});