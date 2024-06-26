'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useNFTStore } from '../store/nftStore';
import { Button, Loader, Input } from '../components';

const resellNFT = () => {
  const { createSale } = useNFTStore();
  const router = useRouter();
  const { tokenId, tokenURI } = router.query;
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchNFT = async () => {
    const { data } = await axios.get(`${tokenURI}/metadata.json`);
    const stringImageURI = data.image.toString().split('//');
    const formattedImageURI = stringImageURI[1];
    const imageURI = `https://gateway.ipfs.io/ipfs/${formattedImageURI}`;

    setPrice(data.price);
    setImage(imageURI);
    setIsLoading(false);
  };

  useEffect(() => {
    if (tokenURI) fetchNFT();
  }, [tokenURI]);

  const resell = async () => {
    await createSale(tokenURI, price, true, tokenId);
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex justify-center sm:px-4 p-12">
      <div className="w-3/5 md:w-full">
        <h1 className="font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 sm:ml-0">Resell NFT</h1>
        <Input inputType="number" title="Price" placeholder="NFT Price" handleClick={(e) => setPrice(e.target.value)} />
        {image && <img src={image} className="rounded mt-4" width={350} />}
        <div className="mt-7 w-full flex justify-end">
          <Button btnName="List NFT" classStyles="rounded-xl" handleClick={resell} />
        </div>
      </div>
    </div>
  );
};

export default resellNFT;
