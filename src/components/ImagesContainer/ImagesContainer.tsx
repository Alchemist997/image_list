import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Container, ImageList, ImageListItem, Modal, NativeSelect, Pagination } from '@mui/material';
import { ArrowCircleLeft, ArrowCircleRight, GitHub } from '@mui/icons-material';
import ImageItem from './../ImageItem/ImageItem';
import SVG from '../SVGList';
import sx from '../sxStyles';

function ImagesContainer() {
  const [itemsData, setItemsData] = useState<ImagesData>({ isEmpty: true });
  const [imagesIdToRemove, setImagesIdToRemove] = useState<DefaultObject>({});
  const [page, setPage] = useState<number>(1);
  const [pagesQty, setPagesQty] = useState<number>(100);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [modalContentIsLoading, setModalContentIsLoading] = useState<boolean>(true);
  const [currentModalContent, setCurrentModalContent] = useState<DefaultObject>({});


  function modalCloseHandler() {
    setModalIsOpen(false);
    setModalContentIsLoading(true);
  }


  const getActualSiblingItem = useCallback(
    function (isNext?: boolean): number {
      const currentId = currentModalContent.id;

      for (let i = currentId; isNext ? i <= page * 50 : i > 0; isNext ? i++ : i--) {
        const siblingId = itemsData[page].get(isNext ? i + 1 : i - 1)?.id;

        if (!siblingId || imagesIdToRemove[siblingId]) continue;

        setModalContentIsLoading(true);
        return siblingId;
      }

      return currentId;
    },
    [currentModalContent.id, itemsData, imagesIdToRemove, page]
  );


  const updateModalContent = useCallback(
    function (itemId: number) {
      const item = itemsData[page].get(itemId);
      if (!item) return;

      setCurrentModalContent({
        url: item.url,
        title: item.title,
        id: item.id,
      });
    },
    [itemsData, page]
  );


  const onClickHandler = useCallback(
    function (evt: MouseEvent) {
      const target = evt.target as HTMLElement;
      const item = target.closest('.image-list-item') as HTMLElement;
      if (!item) return;

      const id = Number(item.dataset.id);

      if (!id || imagesIdToRemove[id]) return;

      if (!target.closest('.close')) {
        updateModalContent(id);
        setModalIsOpen(true);
        return;
      }

      setImagesIdToRemove(prev => { return { ...prev, [id]: true }; });

      axios
        .delete(`https://jsonplaceholder.typicode.com/photos/${id}`)

        .then(() => {
          itemsData[page].delete(id);
          setItemsData((prev: ImagesData) => { return { ...prev }; });
        })

        .catch(err => {
          console.log(err);
          alert(`При удалении элемента с id ${id} произошла ошибка`);
        })

        .finally(() => {
          setImagesIdToRemove(prev => {
            delete prev[id];
            return { ...prev };
          });
        });
    },
    [itemsData, imagesIdToRemove, page, updateModalContent]
  );


  useEffect(() => {
    axios
      .get('https://jsonplaceholder.typicode.com/photos')
      .then(response => {
        const responseData: Array<DefaultObject> = response.data;
        const listItems: ImagesData = {};

        const lastAlbumId = responseData
          .reduce((prevAlbumId: number, currentElement: DefaultObject) => {
            const currentId = currentElement.albumId;

            prevAlbumId !== currentId
              ? listItems[currentId] = new Map([[currentElement.id, currentElement]])
              : listItems[currentId].set(currentElement.id, currentElement);

            return currentId;
            // reduce применён вместо более читабельного forEach, т.к. даёт возможность
            // без использования ещё одной переменной сохранять номер страницы в аккумуляторе
            // и последнюю страницу далее использовать в setPagesQty,
            // вместо Object.keys(listItems).at(-1)
          }, 0);

        setItemsData(listItems);
        setPagesQty(lastAlbumId);
      })
      .catch(err => {
        alert(err);
      });
  }, []);


  useEffect(() => {
    function pageChangeHandler(page: number) {
      if (page < 1 || page > pagesQty) return;
      setPage(page);
    }

    function onKeyDownhandler(evt: KeyboardEvent) {
      if (!itemsData) return;

      const keyCode = evt.code;

      if (keyCode === 'ArrowLeft') {
        modalIsOpen
          ? updateModalContent(getActualSiblingItem())
          : pageChangeHandler(page - 1);
      }

      if (keyCode === 'ArrowRight') {
        modalIsOpen
          ? updateModalContent(getActualSiblingItem(true))
          : pageChangeHandler(page + 1);
      }
    }

    window.addEventListener('keydown', onKeyDownhandler);
    document.addEventListener('click', onClickHandler);

    return () => {
      window.removeEventListener('keydown', onKeyDownhandler);
      document.removeEventListener('click', onClickHandler);
    };
  }, [itemsData, getActualSiblingItem, modalIsOpen, onClickHandler, page, pagesQty, updateModalContent]);


  return (
    <>
      <Container component='main' sx={sx.container}>
        {!itemsData.isEmpty
          ? itemsData[page].size
            ? <ImageList
              className='main'
              cols={5}
              sx={sx.imageList}
              gap={20}
            >

              {[...itemsData[page].values()].map((el: DefaultObject) => (
                <ImageListItem
                  key={el.id}
                  data-id={el.id}
                  className='image-list-item'
                  sx={{ cursor: 'pointer' }}
                >

                  <ImageItem
                    src={el.thumbnailUrl}
                    title={el.title}
                    id={el.id}
                    hasCloseBtn={true}
                    removalStage={imagesIdToRemove[el.id]}
                  />

                </ImageListItem>
              ))}

            </ImageList>

            : <p>В альбоме с id {page} нет элементов</p>
          : <SVG name='loader' />
        }
      </Container>

      <Modal open={modalIsOpen} sx={sx.modal} onClose={modalCloseHandler}>
        <div className='modal-content-wrap'>
          {modalContentIsLoading && <SVG name='loader' />}

          <ImageItem
            src={currentModalContent.url}
            title={currentModalContent.title}
            id={currentModalContent.id}
            onImgLoading={() => {
              setModalContentIsLoading(false);
            }}
          />

          <ArrowCircleLeft
            className='arrow arrow--left'
            onClick={() => {
              updateModalContent(getActualSiblingItem());
            }}
          />
          <ArrowCircleRight
            className='arrow arrow--right'
            onClick={() => {
              updateModalContent(getActualSiblingItem(true));
            }}
          />
        </div>
      </Modal>

      {itemsData !== null && (
        <div className='bottom-panel'>
          <Container className='bottom-panel__container'>
            <a href="https://github.com/Alchemist997/image_list"
              target='_blank'
              rel="noreferrer"
              title='Код на Гитхабе'
              className="git-btn-wrap">
              <GitHub className='git-btn' />
            </a>

            <Pagination
              page={page}
              count={pagesQty}
              onChange={(e, page) => { setPage(page); }}
            />

            <NativeSelect
              value={page}
              onChange={evt => { setPage(+evt.target.value); }}
            >
              {Object.keys(itemsData)
                .map(el => {
                  if (!+el) return null;
                  return <option key={el} value={el}>{el}</option>;
                })}
            </NativeSelect>
          </Container>
        </div>
      )}
    </>
  );
}

export default ImagesContainer;
