import { authService } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { MdOutlineClose } from "react-icons/md";
import FindPasswordModal from "./find_password_modal";

const FindPassword = ({
  setEmail,
  email,
  findPassword,
  setFindPassword,
}: any) => {
  const [modal, setModal] = useState(false);

  // 비밀번호 재설정 함수 (비밀번호 찾기)
  const resetPassword = () => {
    if (email !== "") {
      sendPasswordResetEmail(authService, email)
        .then(function () {
          console.log("성공! 메일을 확인하고, 비밀번호를 변경해주세요.");
          setModal(true);
        })
        .catch(function (error: any) {
          const errorMessage = error.message;
          if (errorMessage.includes("user-not-found")) {
            alert("가입되지 않은 이메일입니다.");
          }
        });
    } else {
      alert("메일을 입력해주세요.");
    }
  };

  return (
    <>
      {/* 웹 */}
      <div className=" sm:block flex justify-center items-center">
        <div className="w-full h-full fixed left-0 top-0 z-[9] bg-[rgba(0,0,0,0.5)] backdrop-blur-[2px]" />
        <div className="inner max-w-[588px] max-h-[454px] w-full h-full bg-white z-[10] fixed top-1/2 left-1/2 rounded transform -translate-x-1/2 -translate-y-1/2 overflow-auto scrollbar-none">
          <div className="loginContainer flex-col text-center">
            <MdOutlineClose
              onClick={() => setFindPassword(false)}
              className="absolute top-8 right-8 w-6 h-6 cursor-pointer duration-150 hover:text-red-400"
            />
            <h4 className="text-[28px] font-bold mt-[88px] mb-[18px]">
              비밀번호를 잊으셨나요?
            </h4>
            <p className="max-w-[358px] w-full mb-[52px] pl-3 m-auto text-center text-textGray">
              가입한 이메일 주소를 입력해주세요.
            </p>
            <input
              type="text"
              placeholder="비밀번호를 변경할 이메일을 입력하세요."
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-[472px] w-full h-[44px] pl-6 mb-[72px] m-auto bg-[#f5f5f5] placeholder-phGray"
            />
            <div
              onClick={resetPassword}
              className="w-[280px] h-[48px] mb-[72px] m-auto flex justify-center items-center bg-primary text-white rounded font-bold  "
            >
              <p>인증번호 받기</p>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 */}
      <div className="sm:hidden sm:w-full sm:h-auto sm:flex sm:justify-center sm:items-center">
        <div className="inner w-full h-full bg-white z-[10] fixed top-1/2 left-1/2 rounded transform -translate-x-1/2 -translate-y-1/2 overflow-auto scrollbar-none">
          <div className="loginContainer flex-col text-center">
            <MdOutlineClose
              onClick={() => setFindPassword(false)}
              className="absolute top-[60px] right-6 w-5 h-5 cursor-pointer duration-150 hover:text-red-400"
            />
            <h4 className="text-[24px] font-bold mt-[100px] mb-[71px]">
              비밀번호를 잊으셨나요?
            </h4>
            <p className="max-w-[358px] w-full mb-3 pl-3 m-auto text-left text-textGray text-sm">
              가입한 이메일 주소를 입력해주세요.
            </p>
            <input
              type="text"
              placeholder="재설정 코드를 받을 이메일을 입력하세요."
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-[358px] w-full h-[56px] pl-6 mb-[83px] m-auto bg-[#f5f5f5] placeholder-phGray"
            />
            <div
              onClick={resetPassword}
              className="w-[344px] h-[48px] mb-[29px] m-auto flex justify-center items-center bg-primary text-white rounded   "
            >
              <p>인증번호 받기</p>
            </div>
          </div>
        </div>
      </div>
      {modal === true ? (
        <FindPasswordModal
          setFindPassword={setFindPassword}
          setModal={setModal}
          setEmail={setEmail}
        />
      ) : null}
    </>
  );
};

export default FindPassword;
