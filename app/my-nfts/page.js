'use client'
import { useEffect, useState } from 'react';

import Image from 'next/image';
import { shortenAddress } from '../Utils/shortenAddress';

import { useNFTStore } from '../store/nftStore';
import { NFTCard, Loader, Banner } from '../components';

import img from '../../assets';

const myNFTs = () => {
  const { fetchMyNFTsOrListedNFTs, currentAccount } = useNFTStore()
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMyNFTsOrListedNFTs().then((items) => {
      setNfts(items);
      setIsLoading(false);
      console.log({ items });
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full flex justify-start items-center flex-col min-h-screen ">
      <div className="w-full flexCenter flex-col">
        <Banner name="Your Nifty NFTs" childStyles="text-center mb-4" parentStyles="h-80 justify-center" />
        <div className="flexCenter flex-col -mt-20 z-0">
          <div className="flexCenter w-40 h-40 sm:w-36 sm:h-36 p-1 bg-nft-black-2 dark:bg-white rounded-full">
            <Image src={img.creator1} className="rounded-full object-cover" objectFit="cover" />
          </div>
          <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl mt-6">{shortenAddress(currentAccount)}</p>
        </div>
      </div>
      {!isLoading && !nfts.length ? (
        <div className="flexCenter sm:p-4 p-16">
          <h1 className="font-poppins dark:text-white text-nft-black-1 font-extrabold text-3xl">No NFTs Owned</h1>
        </div>
      ) : (
        <div className="sm:p-4 p-12 w-full minmd:w-4/5 flexCenter flex-col">
          <div className="flex-1 w-full flex flex-row sm;flex-col px-4 xs:px-0 minlg:px-8">searchbar</div>
          <div className="mt-3 w-full flex flex-wrap">
            {nfts.map((nft) => (
              <NFTCard key={nft.tokenId} nft={nft} onProfilePage/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default myNFTs;
