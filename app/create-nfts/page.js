'use client'
import { useState, useMemo, useCallback} from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useNFTStore } from '../store/nftStore';
import { Button, Input } from '../components';
import img from '../../assets';

const createNFT = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, setFormInput] = useState({ price: '', name: '', description: '' });
  const { theme } = useTheme();
  const router = useRouter();
  const { uploadToIPFS, CreateNFT } = useNFTStore()
  const onDrop = useCallback(async (acceptedFile) => {
    const url = await uploadToIPFS(acceptedFile[0]);
    setFileUrl(url);
    console.log({ url });
  }, []);
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxSize: 5000000,
  });
  const fileStyle = useMemo(
    () => `dark:bg-nft-black-1 bg-white border dark:border-white border-nft-gray-2 flex flex-col item-center p-5 rounded-sm border-dashed
  ${isDragActive && 'border-file-active'}
  ${isDragAccept && 'border-file-accept'}
  ${isDragReject && 'border-file-reject'}`,
    [isDragActive, isDragAccept, isDragReject],
  );
  return (
    <div className="flex justify-center sm:px-4 p-12">
      <div className="w-3/5 md:w-full">
        <h1 className="font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 sm:ml-0">Create New NFT</h1>
        <div className="mt-16">
          <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">Upload File</p>
          <div className="mt-4">
            <div {...getRootProps()} className={fileStyle}>
              <input {...getInputProps()} />
              <div className="flexCenter flex-col text-center">
                <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">PNG 100MB.</p>
                <div className="my-12 w-full flex justify-center">
                  <Image src={img.upload} width={100} height={100} objectFit="contain" alt="file Upload" className={theme === 'light' ? 'filter invert' : undefined} />
                </div>
                <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm">Drag and Drop File</p>
                <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm mt-2">or Browse media from your device</p>
              </div>
            </div>
            {fileUrl && (
              <aside>
                <div className="mt-7">
                  <img src={fileUrl} alt="asset_file" className="rounded" />
                </div>
              </aside>
            )}
          </div>
        </div>
        <Input inputType="input" title="Name" placeholder="NFT Name" handleClick={(e) => setFormInput({ ...formInput, name: e.target.value })} />
        <Input inputType="textarea" title="Description" placeholder="NFT Description" handleClick={(e) => setFormInput({ ...formInput, description: e.target.value })} />
        <Input inputType="number" title="Price" placeholder="NFT Price" handleClick={(e) => setFormInput({ ...formInput, price: e.target.value })} />

        <div className="mt-7 w-full flex justify-end">
          <Button btnName="Create NFT" classStyles="rounded-xl" handleClick={() => CreateNFT(formInput, fileUrl, router)} />
        </div>
      </div>
    </div>
  );
};

export default createNFT;
