// pages/ProfilePage.tsx
const ProfilePage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Profile information here</p>
      </div>
    </div>
  );
};

export default ProfilePage;