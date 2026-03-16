import { useNavigate } from 'react-router-dom';
import { useTheme } from './theme/context';
import { useAuth } from './auth/context';
import styles from './ProfileScreen.module.css';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleBack = () => navigate('/');
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user.fullName
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user.email[0].toUpperCase();

  return (
    <div className={styles.container} style={{ backgroundColor: colors.background }}>
      <div className={styles.scrollContent}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            style={{ borderColor: colors.border, color: colors.text }}
            onClick={handleBack}
            aria-label="Back to home"
          >
            ← Back
          </button>
          <h1 className={styles.headerTitle} style={{ color: colors.text }}>
            Profile
          </h1>
        </header>

        <div
          className={styles.profileCard}
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <div
            className={styles.avatarLarge}
            style={{ backgroundColor: colors.primary, color: '#ffffff' }}
          >
            {initials}
          </div>
          <h2 className={styles.displayName} style={{ color: colors.text }}>
            {user.fullName}
          </h2>
          <p className={styles.email} style={{ color: colors.secondaryText }}>
            {user.email}
          </p>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle} style={{ color: colors.text }}>
            Account details
          </h2>
          <div
            className={styles.infoCard}
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <div className={styles.infoRow} style={{ borderBottomColor: colors.border }}>
              <span className={styles.infoLabel} style={{ color: colors.secondaryText }}>
                Full name
              </span>
              <span className={styles.infoValue} style={{ color: colors.text }}>
                {user.fullName}
              </span>
            </div>
            <div className={styles.infoRow} style={{ borderBottomColor: colors.border }}>
              <span className={styles.infoLabel} style={{ color: colors.secondaryText }}>
                Email
              </span>
              <span className={styles.infoValue} style={{ color: colors.text }}>
                {user.email}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel} style={{ color: colors.secondaryText }}>
                Account ID
              </span>
              <span className={styles.infoValue} style={{ color: colors.text }}>
                {user.id}
              </span>
            </div>
          </div>
        </section>

        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
          aria-label="Log out"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
