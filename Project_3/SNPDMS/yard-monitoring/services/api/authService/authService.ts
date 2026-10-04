import clientAxios from "../client";

export const login = async (
  username: string,
  password: string,
  setLoading: Function,
  setTokens: Function,
  setUser: any,
  router: any,
  setShowloginError: Function
) => {
  setLoading(true);
  try {
    const res = await clientAxios.post("/account/login/token/", {
      username,
      password,
    });
    await setTokens(res.data.access, res.data.refresh);
    setUser({
      automatic_mnr_status_change: res.data.automatic_mnr_status_change,
      en_block_movement: res.data.en_block_movement,
      en_block_movement_v2: res.data.en_block_movement_v2,
      loaded_yard_module: res.data.loaded_yard_module,
      location: res.data.location,
      lolo_finance: res.data.lolo_finance,
      mnr_ftp_upload: res.data.mnr_ftp_upload,
      mnr_module: res.data.mnr_module,
      mnr_team: res.data.mnr_team,
      new_billing_module: res.data.new_billing_module,
      payment_due_date: res.data.payment_due_date,
      procurement_admin: res.data.procurement_admin,
      procurement_module: res.data.procurement_module,
      role: res.data.role,
      site: res.data.site,
      site_type: res.data.site_type,
      transportation_module: res.data.transportation_module,
      truck_tracking: res.data.truck_tracking,
      username: res.data.username,
    });

    router.replace("/(tabs)");
  } catch (error) {
    setShowloginError(true);
    setTimeout(() => {
      setShowloginError(false);
    }, 3000);
  } finally {
    setLoading(false);
  }
};
