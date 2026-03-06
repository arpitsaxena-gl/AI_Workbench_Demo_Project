import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

const { width } = Dimensions.get('window');

// Placeholder data
const statsData = [
  { label: 'Total Users', value: '12.5K', icon: '👥', color: '#4A90E2' },
  { label: 'Revenue', value: '$45.2K', icon: '💰', color: '#50C878' },
  { label: 'Orders', value: '1.2K', icon: '📦', color: '#FF6B6B' },
  { label: 'Growth', value: '+24%', icon: '📈', color: '#FFA500' },
];

const quickActions = [
  { title: 'Create Post', icon: '✍️', color: '#6366F1' },
  { title: 'Upload Media', icon: '📷', color: '#EC4899' },
  { title: 'Analytics', icon: '📊', color: '#10B981' },
  { title: 'Settings', icon: '⚙️', color: '#6B7280' },
];

const featuredItems = [
  {
    id: '1',
    title: 'Premium Feature',
    subtitle: 'Unlock advanced capabilities',
    image: '🖼️',
    badge: 'New',
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Pro Tools',
    subtitle: 'Professional grade utilities',
    image: '🛠️',
    badge: 'Popular',
    rating: 4.9,
  },
  {
    id: '3',
    title: 'Enterprise Suite',
    subtitle: 'Complete business solution',
    image: '🏢',
    badge: 'Hot',
    rating: 5,
  },
];

const recentActivity = [
  { id: '1', user: 'John Doe', action: 'completed task', time: '2m ago', avatar: '👤' },
  { id: '2', user: 'Jane Smith', action: 'uploaded file', time: '15m ago', avatar: '👤' },
  { id: '3', user: 'Mike Johnson', action: 'created project', time: '1h ago', avatar: '👤' },
  { id: '4', user: 'Sarah Wilson', action: 'shared document', time: '2h ago', avatar: '👤' },
  { id: '5', user: 'Tom Brown', action: 'updated profile', time: '3h ago', avatar: '👤' },
];

const categories = [
  { name: 'All', active: true },
  { name: 'Design', active: false },
  { name: 'Development', active: false },
  { name: 'Marketing', active: false },
  { name: 'Business', active: false },
];

const notifications = [
  { id: '1', title: 'New message', description: 'You have 3 unread messages', time: '5m', unread: true },
  { id: '2', title: 'Task reminder', description: 'Complete project review by EOD', time: '1h', unread: true },
  { id: '3', title: 'System update', description: 'New features available', time: '2h', unread: false },
];

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const backgroundColor = isDarkMode ? '#0a0a0a' : '#f8f9fa';
  const textColor = isDarkMode ? '#ffffff' : '#1a1a1a';
  const cardBackground = isDarkMode ? '#1a1a1a' : '#ffffff';
  const secondaryText = isDarkMode ? '#a0a0a0' : '#6b7280';
  const borderColor = isDarkMode ? '#2a2a2a' : '#e5e7eb';

  const renderStatCard = (item: typeof statsData[0], index: number) => (
    <View
      key={index}
      style={[
        styles.statCard,
        {
          backgroundColor: cardBackground,
          borderColor: borderColor,
        },
      ]}>
      <Text style={styles.statIcon}>{item.icon}</Text>
      <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
      <Text style={[styles.statLabel, { color: secondaryText }]}>{item.label}</Text>
    </View>
  );

  const renderQuickAction = (item: typeof quickActions[0], index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.quickActionButton, { backgroundColor: item.color }]}
      activeOpacity={0.8}>
      <Text style={styles.quickActionIcon}>{item.icon}</Text>
      <Text style={styles.quickActionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderFeaturedItem = ({ item }: { item: typeof featuredItems[0] }) => (
    <View
      style={[
        styles.featuredCard,
        {
          backgroundColor: cardBackground,
          borderColor: borderColor,
        },
      ]}>
      <View style={styles.featuredImageContainer}>
        <Text style={styles.featuredImage}>{item.image}</Text>
        <View style={[styles.badge, { backgroundColor: '#FF6B6B' }]}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      </View>
      <View style={styles.featuredContent}>
        <Text style={[styles.featuredTitle, { color: textColor }]}>{item.title}</Text>
        <Text style={[styles.featuredSubtitle, { color: secondaryText }]}>
          {item.subtitle}
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.star}>⭐</Text>
          <Text style={[styles.rating, { color: textColor }]}>{item.rating}</Text>
        </View>
      </View>
    </View>
  );

  const renderActivityItem = ({ item }: { item: typeof recentActivity[0] }) => (
    <View style={styles.activityItem}>
      <View style={[styles.avatarContainer, { backgroundColor: borderColor }]}>
        <Text style={styles.avatar}>{item.avatar}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityText, { color: textColor }]}>
          <Text style={styles.activityUser}>{item.user}</Text> {item.action}
        </Text>
        <Text style={[styles.activityTime, { color: secondaryText }]}>{item.time}</Text>
      </View>
    </View>
  );

  const renderNotification = ({ item }: { item: typeof notifications[0] }) => (
        <View
          style={[
            styles.notificationCard,
            {
              backgroundColor: item.unread
                ? isDarkMode
                  ? '#1a1a2a'
                  : '#f0f4ff'
                : cardBackground,
              borderColor: borderColor,
            },
          ]}>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: textColor }]}>
            {item.title}
          </Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
        <Text style={[styles.notificationDescription, { color: secondaryText }]}>
          {item.description}
        </Text>
        <Text style={[styles.notificationTime, { color: secondaryText }]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, paddingTop: insets.top },
      ]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: secondaryText }]}>Good Morning</Text>
            <Text style={[styles.headerTitle, { color: textColor }]}>
              Welcome Back! 👋
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: '#4A90E2' }]}
              onPress={handleLoginPress}
              accessibilityRole="button"
              accessibilityLabel="Login">
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: cardBackground, borderColor: borderColor }]}>
              <Text style={styles.iconButtonText}>🔔</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: cardBackground, borderColor: borderColor }]}>
              <Text style={styles.iconButtonText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: cardBackground, borderColor: borderColor }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search anything..."
            placeholderTextColor={secondaryText}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          {statsData.map((item, index) => renderStatCard(item, index))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((item, index) => renderQuickAction(item, index))}
          </View>
        </View>

        {/* Progress Section */}
        <View style={[styles.progressCard, { backgroundColor: cardBackground, borderColor: borderColor }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: textColor }]}>Monthly Goal</Text>
            <Text style={[styles.progressPercentage, { color: '#4A90E2' }]}>75%</Text>
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: borderColor }]}>
            <View style={[styles.progressBar, { width: '75%', backgroundColor: '#4A90E2' }]} />
          </View>
          <Text style={[styles.progressSubtext, { color: secondaryText }]}>
            $3,750 of $5,000 completed
          </Text>
        </View>

        {/* Categories Filter */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: category.active ? '#4A90E2' : cardBackground,
                    borderColor: category.active ? '#4A90E2' : borderColor,
                  },
                ]}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.categoryText,
                    { color: category.active ? '#ffffff' : textColor },
                  ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Featured</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: '#4A90E2' }]}>See All →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredItems}
            renderItem={renderFeaturedItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>

        {/* Chart/Graph Placeholder */}
        <View style={[styles.chartCard, { backgroundColor: cardBackground, borderColor: borderColor }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: textColor }]}>Analytics Overview</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4A90E2' }]} />
                <Text style={[styles.legendText, { color: secondaryText }]}>Views</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#50C878' }]} />
                <Text style={[styles.legendText, { color: secondaryText }]}>Clicks</Text>
              </View>
            </View>
          </View>
          <View style={styles.chartContainer}>
            {/* Bar Chart Visualization */}
            <View style={styles.barChart}>
              {[65, 80, 45, 90, 70, 85, 60].map((height, index) => (
                <View key={`bar-${index}-${height}`} style={styles.barChartContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${height}%`,
                        backgroundColor: index % 2 === 0 ? '#4A90E2' : '#50C878',
                      },
                    ]}
                  />
                  <Text style={[styles.barLabel, { color: secondaryText }]}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: '#4A90E2' }]}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.activityCard, { backgroundColor: cardBackground, borderColor: borderColor }]}>
            <FlatList
              data={recentActivity}
              renderItem={renderActivityItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Notifications</Text>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.notificationsList}
          />
        </View>

        {/* Form Section */}
        <View style={[styles.formCard, { backgroundColor: cardBackground, borderColor: borderColor }]}>
          <Text style={[styles.formTitle, { color: textColor }]}>Quick Feedback</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                color: textColor,
              },
            ]}
            placeholder="Share your thoughts..."
            placeholderTextColor={secondaryText}
            multiline
            numberOfLines={4}
          />
          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.formButton, styles.formButtonSecondary, { borderColor: borderColor }]}>
              <Text style={[styles.formButtonText, { color: textColor }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.formButton, styles.formButtonPrimary]}>
              <Text style={styles.formButtonTextPrimary}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Popular Tags</Text>
          <View style={styles.tagsContainer}>
            {['React Native', 'TypeScript', 'UI/UX', 'Mobile', 'Design', 'Development'].map(
              (tag) => (
                <View
                  key={tag}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
                      borderColor: borderColor,
                    },
                  ]}>
                  <Text style={[styles.tagText, { color: textColor }]}>#{tag}</Text>
                </View>
              ),
            )}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  iconButtonText: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    padding: 4,
  },
  filterIcon: {
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 44) / 2,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: (width - 44) / 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
  },
  categoriesContainer: {
    gap: 12,
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  featuredList: {
    gap: 16,
    paddingRight: 16,
  },
  featuredCard: {
    width: width * 0.7,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  featuredImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  featuredImage: {
    fontSize: 64,
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 20,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredContent: {
    gap: 8,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  featuredSubtitle: {
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    fontSize: 16,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },
  chartContainer: {
    height: 200,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
    paddingVertical: 20,
  },
  barChartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    marginHorizontal: 4,
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
  },
  activityCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    marginBottom: 4,
  },
  activityUser: {
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  notificationContent: {
    gap: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
  },
  notificationDescription: {
    fontSize: 14,
  },
  notificationTime: {
    fontSize: 12,
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  formButtonSecondary: {
    backgroundColor: 'transparent',
  },
  formButtonPrimary: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  formButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formButtonTextPrimary: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;
