import React, { useEffect } from 'react';
import IconBtn from './IconBtn';

export default function ConfirmationModal({
  modalData,
  closeModal,
  // Direct props for backward compatibility
  text1,
  text2,
  btn1Text,
  btn2Text,
  btn1Handler,
  btn2Handler,
}) {
  // Support both modalData object and direct props
  const data = modalData || {
    text1,
    text2,
    btn1Text,
    btn2Text,
    btn1Handler,
    btn2Handler,
  };

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="w-11/12 max-w-[350px] rounded-lg border border-richblack-400 bg-richblack-800 p-6">
        <p className="text-2xl font-semibold text-richblack-5">
          {data?.text1}
        </p>
        <p className="mt-3 mb-5 leading-6 text-richblack-200">
          {data?.text2}
        </p>
        <div className="flex items-center gap-x-4">
          <IconBtn
            onClick={data?.btn1Handler}
            text={data?.btn1Text}
            customClasses="rounded-md bg-yellow-50 px-4 py-2 text-richblack-900 font-semibold hover:scale-95 transition-all duration-200"
          />
          <button
            className="cursor-pointer rounded-md bg-richblack-200 px-4 py-2 text-richblack-900 font-semibold hover:scale-95 transition-all duration-200"
            onClick={data?.btn2Handler}
          >
            {data?.btn2Text}
          </button>
        </div>
      </div>
    </div>
  );
}
