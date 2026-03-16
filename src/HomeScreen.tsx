import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './theme/context';
import { useAuth } from './auth/context';
import styles from './HomeScreen.module.css';

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

const HomeScreen: React.FC = () => {
  const { colors, isDarkMode } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLoginPress = () => navigate('/login');
  const handleProfilePress = () => navigate('/profile');
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.container} style={{ backgroundColor: colors.background }}>
      <div className={styles.scrollContent}>
        {/* Header Section */}
        <header className={styles.header}>
          <div>
            <p className={styles.greeting} style={{ color: colors.secondaryText }}>
              {isAuthenticated && user ? `Hello, ${user.fullName.split(/\s+/)[0]}` : 'Good Morning'}
            </p>
            <h1 className={styles.headerTitle} style={{ color: colors.text }}>
              {isAuthenticated ? 'Welcome Back! 👋' : 'Welcome! 👋'}
            </h1>
          </div>
          <div className={styles.headerActions}>
            {isAuthenticated ? (
              <>
                <button
                  className={styles.loginButton}
                  onClick={handleProfilePress}
                  aria-label="Profile"
                  style={{ backgroundColor: colors.primary }}
                >
                  Profile
                </button>
                <button
                  className={styles.iconButton}
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
                  onClick={handleProfilePress}
                  aria-label="Profile"
                >
                  <span className={styles.iconButtonText}>👤</span>
                </button>
                <button
                  className={styles.iconButton}
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                  <span className={styles.iconButtonText}>🔔</span>
                  <span className={styles.notificationBadge}>3</span>
                </button>
                <button
                  className={styles.iconButton}
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                  <span className={styles.iconButtonText}>⚙️</span>
                </button>
                <button
                  className={styles.loginButton}
                  onClick={handleLogout}
                  aria-label="Log out"
                  style={{ backgroundColor: 'transparent', border: `1px solid ${colors.border}`, color: colors.text }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  className={styles.loginButton}
                  onClick={handleLoginPress}
                  aria-label="Login"
                >
                  Login
                </button>
                <button
                  className={styles.iconButton}
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                  <span className={styles.iconButtonText}>🔔</span>
                  <span className={styles.notificationBadge}>3</span>
                </button>
                <button
                  className={styles.iconButton}
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                  <span className={styles.iconButtonText}>⚙️</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Search Bar */}
        <div className={styles.searchContainer} style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search anything..."
            style={{ color: colors.text }}
          />
          <button className={styles.filterButton}>
            <span className={styles.filterIcon}>⚙️</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsContainer}>
          {statsData.map((item, index) => (
            <div
              key={index}
              className={styles.statCard}
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <span className={styles.statIcon}>{item.icon}</span>
              <span className={styles.statValue} style={{ color: item.color }}>{item.value}</span>
              <span className={styles.statLabel} style={{ color: colors.secondaryText }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle} style={{ color: colors.text }}>Quick Actions</h2>
          <div className={styles.quickActionsContainer}>
            {quickActions.map((item, index) => (
              <button
                key={index}
                className={styles.quickActionButton}
                style={{ backgroundColor: item.color }}
              >
                <span className={styles.quickActionIcon}>{item.icon}</span>
                <span className={styles.quickActionText}>{item.title}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Progress Section */}
        <div className={styles.progressCard} style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <div className={styles.progressHeader}>
            <span className={styles.progressTitle} style={{ color: colors.text }}>Monthly Goal</span>
            <span className={styles.progressPercentage} style={{ color: '#4A90E2' }}>75%</span>
          </div>
          <div className={styles.progressBarContainer} style={{ backgroundColor: colors.border }}>
            <div className={styles.progressBar} style={{ width: '75%', backgroundColor: '#4A90E2' }} />
          </div>
          <p className={styles.progressSubtext} style={{ color: colors.secondaryText }}>
            $3,750 of $5,000 completed
          </p>
        </div>

        {/* Categories Filter */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle} style={{ color: colors.text }}>Categories</h2>
          <div className={styles.categoriesContainer}>
            {categories.map((category) => (
              <button
                key={category.name}
                className={styles.categoryChip}
                style={{
                  backgroundColor: category.active ? '#4A90E2' : colors.card,
                  borderColor: category.active ? '#4A90E2' : colors.border,
                  color: category.active ? '#ffffff' : colors.text,
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Items */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} style={{ color: colors.text }}>Featured</h2>
            <button className={styles.seeAll} style={{ color: '#4A90E2' }}>See All →</button>
          </div>
          <div className={styles.featuredList}>
            {featuredItems.map((item) => (
              <div
                key={item.id}
                className={styles.featuredCard}
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
              >
                <div className={styles.featuredImageContainer}>
                  <div className={styles.featuredImage}>{item.image}</div>
                  <span className={styles.badge}>{item.badge}</span>
                </div>
                <div className={styles.featuredContent}>
                  <h3 className={styles.featuredTitle} style={{ color: colors.text }}>{item.title}</h3>
                  <p className={styles.featuredSubtitle} style={{ color: colors.secondaryText }}>
                    {item.subtitle}
                  </p>
                  <div className={styles.ratingContainer}>
                    <span className={styles.star}>⭐</span>
                    <span className={styles.rating} style={{ color: colors.text }}>{item.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chart/Graph Placeholder */}
        <div className={styles.chartCard} style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle} style={{ color: colors.text }}>Analytics Overview</h3>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#4A90E2' }} />
                <span className={styles.legendText} style={{ color: colors.secondaryText }}>Views</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: '#50C878' }} />
                <span className={styles.legendText} style={{ color: colors.secondaryText }}>Clicks</span>
              </div>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.barChart}>
              {[65, 80, 45, 90, 70, 85, 60].map((height, index) => (
                <div key={`bar-${index}-${height}`} className={styles.barChartColumn}>
                  <div
                    className={styles.bar}
                    style={{
                      height: `${height}%`,
                      backgroundColor: index % 2 === 0 ? '#4A90E2' : '#50C878',
                    }}
                  />
                  <span className={styles.barLabel} style={{ color: colors.secondaryText }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} style={{ color: colors.text }}>Recent Activity</h2>
            <button className={styles.seeAll} style={{ color: '#4A90E2' }}>View All →</button>
          </div>
          <div className={styles.activityCard} style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            {recentActivity.map((item) => (
              <div key={item.id} className={styles.activityItem} style={{ borderBottomColor: colors.border }}>
                <div className={styles.avatarContainer} style={{ backgroundColor: colors.border }}>
                  <span className={styles.avatar}>{item.avatar}</span>
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText} style={{ color: colors.text }}>
                    <strong className={styles.activityUser}>{item.user}</strong> {item.action}
                  </p>
                  <span className={styles.activityTime} style={{ color: colors.secondaryText }}>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle} style={{ color: colors.text }}>Notifications</h2>
          <div className={styles.notificationsList}>
            {notifications.map((item) => (
              <div
                key={item.id}
                className={styles.notificationCard}
                style={{
                  backgroundColor: item.unread
                    ? isDarkMode ? '#1a1a2a' : '#f0f4ff'
                    : colors.card,
                  borderColor: colors.border,
                }}
              >
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <span className={styles.notificationTitle} style={{ color: colors.text }}>
                      {item.title}
                    </span>
                    {item.unread && <span className={styles.unreadDot} />}
                  </div>
                  <p className={styles.notificationDescription} style={{ color: colors.secondaryText }}>
                    {item.description}
                  </p>
                  <span className={styles.notificationTime} style={{ color: colors.secondaryText }}>
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Form Section */}
        <div className={styles.formCard} style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <h3 className={styles.formTitle} style={{ color: colors.text }}>Quick Feedback</h3>
          <textarea
            className={styles.textArea}
            placeholder="Share your thoughts..."
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            }}
            rows={4}
          />
          <div className={styles.formActions}>
            <button
              className={`${styles.formButton} ${styles.formButtonSecondary}`}
              style={{ borderColor: colors.border, color: colors.text }}
            >
              Cancel
            </button>
            <button className={`${styles.formButton} ${styles.formButtonPrimary}`}>
              Submit
            </button>
          </div>
        </div>

        {/* Tags Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle} style={{ color: colors.text }}>Popular Tags</h2>
          <div className={styles.tagsContainer}>
            {['React', 'TypeScript', 'UI/UX', 'Web', 'Design', 'Development'].map(
              (tag) => (
                <span
                  key={tag}
                  className={styles.tag}
                  style={{
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                >
                  #{tag}
                </span>
              ),
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeScreen;
