import React from 'react';

interface PostFormProps {
  species: string;
  setSpecies: React.Dispatch<React.SetStateAction<string>>;
  lat: string;
  lng: string;
  message: string;
  handleSubmit: (e: React.FormEvent) => void;
  handleGetCurrentLocation: () => void;
}

const PostForm: React.FC<PostFormProps> = ({
  species,
  setSpecies,
  lat,
  lng,
  message,
  handleSubmit,
  handleGetCurrentLocation,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'white',
        padding: '10px',
        borderRadius: '8px',
        zIndex: 1000,
      }}
    >
      <h3>投稿フォーム</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="鳥の名前 (species)"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          required
          style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
        />
        <input
          type="text"
          placeholder="緯度 (latitude)"
          value={lat}
          readOnly
          style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
        />
        <input
          type="text"
          placeholder="経度 (longitude)"
          value={lng}
          readOnly
          style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
        />
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          投稿
        </button>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          style={{
            padding: '10px',
            backgroundColor: '#28A745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          現在地に移動
        </button>
      </form>
      {message && (
        <p
          style={{
            color: message.includes('成功') ? 'green' : 'red',
            marginTop: '10px',
            fontWeight: 'bold',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default PostForm;