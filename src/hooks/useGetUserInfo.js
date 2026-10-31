export const useGetUserInfo = () => {
  try {
    const data = JSON.parse(localStorage.getItem("auth")) || {};
    return {
      name: data.name || "Alex Morgan",
      profilePhoto: data.profilePhoto || null,
      userID: data.userID || null,
      isAuth: Boolean(data.isAuth),
      isGuest: Boolean(data.isGuest),
    };
  } catch (e) {
    return {
      name: "Alex Morgan",
      profilePhoto: null,
      userID: null,
      isAuth: false,
      isGuest: false,
    };
  }
};
