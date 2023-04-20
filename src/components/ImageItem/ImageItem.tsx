import HideImageIcon from '@mui/icons-material/HideImage';
import { ImageListItemBar } from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { useState } from 'react';

interface IImageItem {
  src: string;
  title: string;
  id: number | string;
  hasCloseBtn?: boolean;
  onImgLoading?: () => void;
  removalStage?: boolean;
}

function ImageItem({ src, title, id, hasCloseBtn, onImgLoading, removalStage }: IImageItem) {
  const [imgLoadError, setImgLoadError] = useState<boolean>(false);

  return (
    <>
      {hasCloseBtn && <Cancel className='close' htmlColor='#eee' />}

      {!imgLoadError
        ? <img
          src={src}
          alt={title}
          className={`image-item ${removalStage ? 'zero-saturation' : ''}`}
          onLoad={onImgLoading}
          onError={() => {
            setImgLoadError(true);
            if (onImgLoading) onImgLoading();
          }}
        />

        : <HideImageIcon className='image-item--error' />
      }

      <ImageListItemBar title={id} subtitle={title} />
    </>
  );
}

export default ImageItem;
