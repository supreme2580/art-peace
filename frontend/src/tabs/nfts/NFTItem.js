import React, { useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import './NFTItem.css';
import { fetchWrapper } from '../../services/apiService';
import canvasConfig from '../../configs/canvas.config.json';
import ShareIcon from '../../resources/icons/Share.png';
import LikeIcon from '../../resources/icons/Like.png';
import LikedIcon from '../../resources/icons/Liked.png';
import Info from '../../resources/icons/Info.png';
import { devnetMode } from '../../utils/Consts.js';

const NFTItem = (props) => {
  const likeNftCall = async (tokenId) => {
    if (devnetMode) return;
    if (!props.address || !props.canvasNftContract || !props.account) return;
    const likeCallData = props.canvasNftContract.populate('like_nft', {
      token_id: tokenId
    });
    const { suggestedMaxFee } = await props.estimateInvokeFee({
      contractAddress: props.canvasNftContract.address,
      entrypoint: 'like_nft',
      calldata: likeCallData.calldata
    });
    /* global BigInt */
    const maxFee = (suggestedMaxFee * BigInt(15)) / BigInt(10);
    const result = await props.canvasNftContract.like_nft(
      likeCallData.calldata,
      {
        maxFee
      }
    );
    console.log(result);
  };

  const unlikeNftCall = async (tokenId) => {
    if (devnetMode) return;
    if (!props.address || !props.canvasNftContract || !props.account) return;
    const unlikeCallData = props.canvasNftContract.populate('unlike_nft', {
      token_id: tokenId
    });
    const { suggestedMaxFee } = await props.estimateInvokeFee({
      contractAddress: props.canvasNftContract.address,
      entrypoint: 'unlike_nft',
      calldata: unlikeCallData.calldata
    });
    const maxFee = (suggestedMaxFee * BigInt(15)) / BigInt(10);
    const result = await props.canvasNftContract.unlike_nft(
      unlikeCallData.calldata,
      {
        maxFee
      }
    );
    console.log(result);
  };

  const handleLikePress = async (event) => {
    if (props.queryAddress === '0') {
      return;
    }
    event.preventDefault();
    if (!devnetMode) {
      if (liked) {
        await unlikeNftCall(props.tokenId);
        props.updateLikes(props.tokenId, likes - 1, false);
      } else {
        await likeNftCall(props.tokenId);
        props.updateLikes(props.tokenId, likes + 1, true);
      }
      return;
    }

    if (!liked) {
      let likeResponse = await fetchWrapper('like-nft-devnet', {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify({
          tokenId: props.tokenId.toString()
        })
      });
      if (likeResponse.result) {
        props.updateLikes(props.tokenId, likes + 1, true);
      }
    } else {
      let unlikeResponse = await fetchWrapper('unlike-nft-devnet', {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify({
          tokenId: props.tokenId.toString()
        })
      });
      if (unlikeResponse.result) {
        props.updateLikes(props.tokenId, likes - 1, false);
      }
    }
  };

  const [likes, setLikes] = useState(props.likes);
  const [liked, setLiked] = useState(props.liked);
  useEffect(() => {
    setLikes(props.likes);
    setLiked(props.liked);
  }, [props.likes, props.liked]);

  const posx = props.position % canvasConfig.canvas.width;
  const posy = Math.floor(props.position / canvasConfig.canvas.width);

  const [minterText, setMinterText] = React.useState('');

  function handleShare() {
    const twitterShareUrl = `https://x.com/intent/post?text=${encodeURIComponent(
      'Check out my #ArtPeace @art_peace_sn'
    )}&url=${encodeURIComponent(props.image)}`;
    window.open(twitterShareUrl, '_blank');
  }

  // TODO: Load name from initial query instead of fetching it again
  useEffect(() => {
    async function fetchUsernameUrl() {
      const getUsernameUrl = `get-username?address=${props.minter}`;
      const result = await fetchWrapper(getUsernameUrl);
      if (result.data === null || result.data === '') {
        if (props.minter.length > 12) {
          setMinterText(
            props.minter.substring(0, 4) +
              '...' +
              props.minter.substring(
                props.minter.length - 4,
                props.minter.length
              )
          );
        } else {
          setMinterText(props.minter);
        }
      } else {
        if (result.data.length > 11) {
          setMinterText(result.data.substring(0, 8) + '...');
        } else {
          setMinterText(result.data);
        }
      }
    }
    if (props.minter) {
      fetchUsernameUrl();
    }
  }, [props.minter]);

  const [showInfo, setShowInfo] = React.useState(false);
  const handleNftClick = (e) => {
    if (
      e.target.classList.contains('NFTItem__button') ||
      e.target.classList.contains('Like__icon') ||
      e.target.classList.contains('Share__icon')
    ) {
      return;
    }
    // Format NFT data to match template structure
    const nftTemplate = {
      position: props.position,
      width: props.width,
      height: props.height,
      image: props.image,
      isNft: true,
      tokenId: props.tokenId
    };
    props.setTemplateOverlayMode(true);
    props.setOverlayTemplate(nftTemplate);
    props.setActiveTab('Canvas');
  };
  return (
    <div className='NFTItem'>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div className='NFTItem__imagecontainer'>
          <img
            src={props.image}
            alt={`nft-image-${props.tokenId}`}
            className='NFTItem__image'
            onClick={handleNftClick}
          />
          <p className='Text__xsmall NFTItem__name'>{props.name}</p>
          <div className='NFTItem__overlay'>
            <div className='NFTItem__buttons'>
              <div
                onClick={handleShare}
                className='NFTItem__button'
                style={{ display: 'none' }}
              >
                <img className='Share__icon' src={ShareIcon} alt='Share' />
              </div>
              <div
                className={`NFTItem__button ${
                  liked ? 'Like__button--liked' : ''
                } ${
                  props.queryAddress === '0' ? 'NFTItem__button--disabled' : ''
                }`}
                onClick={handleLikePress}
              >
                <img
                  className='Like__icon'
                  src={liked ? LikedIcon : LikeIcon}
                  alt='Like'
                />
                <p className='Like__count'>{likes}</p>
              </div>
              <div
                onClick={() => setShowInfo(!showInfo)}
                className='TemplateItem__button'
              >
                {showInfo ? (
                  <p
                    className='Text__xsmall'
                    style={{ margin: '0', padding: '0' }}
                  >
                    X
                  </p>
                ) : (
                  <img
                    src={Info}
                    alt='Info'
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '50%',
                      padding: '0.2rem',
                      width: '3rem',
                      height: '3rem'
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <CSSTransition
        in={showInfo}
        timeout={300}
        classNames='NFTItem__info list-transition'
        unmountOnExit
        appear
      >
        <div className='NFTItem__info Text__small'>
          <div
            className='NFTItem__info__item'
            style={{ backgroundColor: 'rgba(255, 64, 61, 0.3)' }}
          >
            <p>Position</p>
            <p>
              ({posx},{posy})
            </p>
          </div>
          <div
            className='NFTItem__info__item'
            style={{ backgroundColor: 'rgba(61, 255, 64, 0.3)' }}
          >
            <p>Size</p>
            <p>
              {props.width} x {props.height}
            </p>
          </div>
          <div
            className='NFTItem__info__item'
            style={{ backgroundColor: 'rgba(64, 61, 255, 0.3)' }}
          >
            <p>Minter</p>
            <p>{minterText}</p>
          </div>
        </div>
      </CSSTransition>
    </div>
  );
};
export default NFTItem;
