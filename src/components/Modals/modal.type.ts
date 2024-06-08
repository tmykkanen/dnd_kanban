import { Dispatch, ReactNode, SetStateAction } from 'react';

export default interface ModalProps {
  children: ReactNode
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  containerClasses?: string;
}