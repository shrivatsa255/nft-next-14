import {create }from 'zustand';
import { NFTStorage, File } from 'nft.storage';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';
import { toast } from 'sonner';
import config from '../../config.json';
import { MarketAddress, MarketAddressesABI } from './constants';

const NFT_STORAGE_TOKEN = config['NFT.storage_API'];
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

const fetchContract = (signerOrProvider) => new ethers.Contract(MarketAddress, MarketAddressesABI, signerOrProvider);

export const useNFTStore = create((set, get) => ({
 currentAccount: '',
 nftCurrency: 'ETH',

 checkIfWalletIsConnected: async () => {
    if (!window.ethereum) return toast.info('Please install MetaMask');

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length) {
      set({ currentAccount: accounts[0] });
    } else {
      toast.info('No Accounts Found')
      console.log('No accounts found');
    }
 },

 connectWallet: async () => {
    if (!window.ethereum) return toast.info('Please install MetaMask');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    set({ currentAccount: accounts[0] });

    window.location.reload();
 },

 createSale: async (url, formInputPrice, isReselling, id) => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInputPrice, 'ether');
    const contract = fetchContract(signer);
    const listingPrice = await contract.getListingPrice();
    const transaction = !isReselling ? await contract.createTokens(url, price, { value: listingPrice.toString() }) : await contract.resellToken(id, price, { value: listingPrice.toString() });

    await transaction.wait();

    console.log(contract);
 },

 uploadToIPFS: async (file) => {
    try {
      const imageFile = new File([file], 'image/*', { type: 'image/*' });
      const result = await client.storeBlob(imageFile);
      const ipfsHash = result.cid;
      console.log(ipfsHash);
      const imageUrl = `https://gateway.ipfs.io/ipfs/${result}/`;
      return imageUrl;
    } catch (error) {
      toast.error('Error uploading image to IPFS');
      console.log('Error uploading image to NFT.storage:', error);
    }
 },

 CreateNFT: async (formInput, fileUrl, router) => {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);
    const imageBlob = new File([imageBuffer], { type: 'image/png' });

    try {
      const result = await client.store({ name, description, image: imageBlob });
      const Url = `https://gateway.ipfs.io/ipfs/${result.ipnft}/`;
      console.log(`NFTMetadataURL:${Url}`);
      await get().createSale(Url, price);
      router.push('/');
    } catch (error) {
      toast.error('Error uploading image to IPFS');
      console.log('Error uploading image to NFT.storage:', error);
    }
 },

 fetchNFTs: async () => {
    const provider = new ethers.providers.JsonRpcProvider();
    const contract = fetchContract(provider);
    const data = await contract.fetchMarketitems();

    try {
      const items = await Promise.all(
        data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
          const tokenURI = await contract.tokenURI(tokenId);
          const response = await axios.get(`${tokenURI}/metadata.json`);
          const { name, description, image } = response.data;
          const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');
          const stringImageURI = image.toString().split('//');
          const formattedImageURI = stringImageURI[1];
          const imageURI = `https://gateway.ipfs.io/ipfs/${formattedImageURI}`;

          return {
            price,
            tokenId: tokenId.toNumber(),
            seller,
            owner,
            image: imageURI,
            name,
            description,
            tokenURI,
          };
        }),
      );
      return items;
    } catch (err) {
      toast.error("Oops... something went wrong")
      console.log(err);
    }
 },

 fetchMyNFTsOrListedNFTs: async (type) => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    const data = type === 'fetchItemsListed' ? await contract.fetchItemsListed() : await contract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId);
        const response = await axios.get(`${tokenURI}/metadata.json`);
        const { name, description, image } = response.data;
        const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');
        const stringImageURI = image.toString().split('//');
        const formattedImageURI = stringImageURI[1];
        const imageURI = `https://gateway.ipfs.io/ipfs/${formattedImageURI}`;

        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          image: imageURI,
          name,
          description,
          tokenURI,
        };
      }),
    );
    return items;
 },

 buyNFT: async (nft) => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
    const transaction = await contract.createMarketSale(nft.tokenId, { value: price });

    await transaction.wait();
 },
}));
