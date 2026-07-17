const fs = require('fs');
let content = fs.readFileSync('src/screens/ExploreSocietiesScreen.tsx', 'utf8');

const oldRender = `  const renderSocietyCard = ({ item }: { item: SocietyItem }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('SocietyProfile', { societyId: item.id })}
      style={[styles.societyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      <View style={[styles.societyCardTop, { backgroundColor: item.primaryColor || theme.colors.primary }]} />
      <View style={styles.societyCardContent}>
        <View style={[styles.societyLogo, { backgroundColor: item.primaryColor, borderColor: theme.colors.background }]}>
          <Text style={styles.societyLogoText}>{item.shortName}</Text>
        </View>
        <Text style={[styles.societyTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.societySubtitle, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {item.description || "Official University Society."}
        </Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => handleJoin(item.id, item.name)}
          style={[styles.joinBtn, { backgroundColor: theme.colors.primary + '15' }]}
        >
          <Text style={[styles.joinBtnText, { color: theme.colors.primary }]}>Join Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );`;

const newRender = `  const renderSocietyCard = ({ item }: { item: SocietyItem }) => {
    const isMember = mySocietyIds.includes(item.id);
    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('SocietyProfile', { societyId: item.id })}
        style={[styles.societyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      >
        <View style={[styles.societyCardTop, { backgroundColor: item.primaryColor || theme.colors.primary }]} />
        <View style={styles.societyCardContent}>
          {item.logoUrl ? (
            <View style={[styles.societyLogo, { backgroundColor: '#FFF', borderColor: theme.colors.background, overflow: 'hidden' }]}>
              <import_Image source={{ uri: item.logoUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </View>
          ) : (
            <View style={[styles.societyLogo, { backgroundColor: item.primaryColor, borderColor: theme.colors.background }]}>
              <Text style={styles.societyLogoText}>{item.shortName}</Text>
            </View>
          )}
          <Text style={[styles.societyTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.societySubtitle, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.description || "Official University Society."}
          </Text>
          <View style={{ flex: 1 }} />
          {!isMember ? (
            <TouchableOpacity
              onPress={() => handleJoin(item.id, item.name)}
              style={[styles.joinBtn, { backgroundColor: theme.colors.primary + '15' }]}
            >
              <Text style={[styles.joinBtnText, { color: theme.colors.primary }]}>Join Now</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('SocietyProfile', { societyId: item.id })}
              style={[styles.joinBtn, { backgroundColor: theme.colors.border }]}
            >
              <Text style={[styles.joinBtnText, { color: theme.colors.textPrimary }]}>View Page</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };`;

content = content.replace(oldRender, newRender.replace('import_Image', 'Image'));
fs.writeFileSync('src/screens/ExploreSocietiesScreen.tsx', content);
