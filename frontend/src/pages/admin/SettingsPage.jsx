import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listSettings, updateSetting } from '../../api/auditApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);

  function load() {
    setLoading(true);
    listSettings().then(({ data }) => setSettings(data.data)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleSave(key, value) {
    setSavingKey(key);
    setSavedKey(null);
    try {
      await updateSetting(key, { value });
      setSavedKey(key);
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{t('admin.settingsTitle')}</h1>

      <div className="mt-6 space-y-3">
        {settings.length === 0 ? (
          <p className="text-sm text-sand">
            No settings have been configured yet. Common keys: REOPEN_WINDOW_DAYS, ESCALATION_ASSIGNMENT_BREACH_DAYS,
            ESCALATION_MANDAL_LEVEL1_DAYS, ESCALATION_DISTRICT_LEVEL2_DAYS.
          </p>
        ) : (
          settings.map((setting) => (
            <SettingRow
              key={setting.key}
              setting={setting}
              saving={savingKey === setting.key}
              saved={savedKey === setting.key}
              onSave={handleSave}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SettingRow({ setting, saving, saved, onSave }) {
  const { t } = useTranslation();
  const [value, setValue] = useState(
    typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value)
  );

  function handleSubmit(e) {
    e.preventDefault();
    const numeric = Number(value);
    onSave(setting.key, Number.isNaN(numeric) ? value : numeric);
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] flex-1">
        <p className="font-mono text-sm">{setting.key}</p>
        {setting.description && <p className="text-xs text-sand">{setting.description}</p>}
      </div>
      <input className="input-field max-w-[160px]" value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="submit" disabled={saving} className="btn-secondary">
        {saving ? t('common.loading') : t('common.save')}
      </button>
      {saved && <span className="text-xs text-moss-600">{t('settings.updated', 'Saved')}</span>}
    </form>
  );
}
