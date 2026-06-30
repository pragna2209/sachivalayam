import { useCallback, useEffect, useState } from 'react';
import {
  listDistricts,
  listMandalsByDistrict,
  listVillagesByMandal,
  listSachivalayamsByVillage
} from '../api/geoApi';

/**
 * Drives the cascading District -> Mandal -> Village -> Sachivalayam
 * selectors used on the complaint form, profile address fields, and
 * staff-jurisdiction assignment form. Selecting a higher level clears and
 * reloads everything below it.
 */
export default function useGeoHierarchy() {
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [sachivalayams, setSachivalayams] = useState([]);

  const [selected, setSelected] = useState({
    districtId: '',
    mandalId: '',
    villageId: '',
    sachivalayamId: ''
  });

  const [loading, setLoading] = useState({ districts: false, mandals: false, villages: false, sachivalayams: false });

  useEffect(() => {
    setLoading((l) => ({ ...l, districts: true }));
    listDistricts()
      .then(({ data }) => setDistricts(data.data))
      .finally(() => setLoading((l) => ({ ...l, districts: false })));
  }, []);

  const selectDistrict = useCallback((districtId) => {
    setSelected({ districtId, mandalId: '', villageId: '', sachivalayamId: '' });
    setMandals([]);
    setVillages([]);
    setSachivalayams([]);
    if (!districtId) return;
    setLoading((l) => ({ ...l, mandals: true }));
    listMandalsByDistrict(districtId)
      .then(({ data }) => setMandals(data.data))
      .finally(() => setLoading((l) => ({ ...l, mandals: false })));
  }, []);

  const selectMandal = useCallback((mandalId) => {
    setSelected((s) => ({ ...s, mandalId, villageId: '', sachivalayamId: '' }));
    setVillages([]);
    setSachivalayams([]);
    if (!mandalId) return;
    setLoading((l) => ({ ...l, villages: true }));
    listVillagesByMandal(mandalId)
      .then(({ data }) => setVillages(data.data))
      .finally(() => setLoading((l) => ({ ...l, villages: false })));
  }, []);

  const selectVillage = useCallback((villageId) => {
    setSelected((s) => ({ ...s, villageId, sachivalayamId: '' }));
    setSachivalayams([]);
    if (!villageId) return;
    setLoading((l) => ({ ...l, sachivalayams: true }));
    listSachivalayamsByVillage(villageId)
      .then(({ data }) => setSachivalayams(data.data))
      .finally(() => setLoading((l) => ({ ...l, sachivalayams: false })));
  }, []);

  const selectSachivalayam = useCallback((sachivalayamId) => {
    setSelected((s) => ({ ...s, sachivalayamId }));
  }, []);

  return {
    districts,
    mandals,
    villages,
    sachivalayams,
    selected,
    loading,
    selectDistrict,
    selectMandal,
    selectVillage,
    selectSachivalayam
  };
}
