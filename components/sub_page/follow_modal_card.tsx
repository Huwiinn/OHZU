import { authService, dbService } from "@/firebase";
import useUpdateUser from "@/hooks/query/user/useUpdateUser";
import useModal from "@/hooks/useModal";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Grade from "../grade";

const FollowModalCard = ({
  profile,
  getMyProfile,
  myProfile,
}: {
  profile: UserType;
  myProfile: any;
  getMyProfile: () => Promise<void>;
}) => {
  const { showModal } = useModal();

  const { isLoading: isLoadingEditUser, mutate: updateUser } = useUpdateUser(
    (profile.userId as string) || (authService.currentUser?.uid as string)
  );

  const onClickFollowUpdate = async () => {
    if (authService.currentUser?.uid) {
      const FollowerArray = profile?.follower!.includes(
        authService.currentUser?.uid as string
      );

      if (FollowerArray) {
        const newFollowerArray = profile?.follower!.filter(
          (id: any) => id !== authService.currentUser?.uid
        );
        const newFollowingArray = myProfile.following.filter(
          (id: any) => id !== profile.userId
        );

        updateUser({
          userId: profile.userId,
          editUserObj: {
            follower: newFollowerArray,
          },
        });

        updateUser({
          userId: authService.currentUser?.uid,
          editUserObj: {
            following: newFollowingArray,
          },
        });
      } else if (!FollowerArray) {
        const newFollowerArray = profile?.follower!.push(
          authService.currentUser?.uid as string
        );
        const newFollowingArray = myProfile.following.push(profile.userId);

        updateUser({
          userId: profile.userId,
          editUserObj: {
            follower: profile.follower,
          },
        });

        updateUser({
          userId: authService.currentUser?.uid,
          editUserObj: {
            following: myProfile.following,
          },
        });
      }
      getMyProfile();
    } else {
      showModal({
        modalType: "ConfirmModal",
        modalProps: {
          title: "로그인 후 이용 가능합니다.",
          text: "로그인 페이지로 이동하시겠어요?",
          rightbtnfunc: () => {
            showModal({
              modalType: "LoginModal",
              modalProps: {},
            });
          },
        },
      });
    }
  };

  return (
    <div key={profile?.userId} className="w-full flex justify-center">
      <Link href={`/users/${profile.userId}`}>
        <div className="w-14 sm:w-[78px] aspect-square rounded-full bg-[#d9d9d9] overflow-hidden">
          {profile.imageURL !== "" ? (
            <Image
              src={profile.imageURL!}
              className="w-14 sm:w-[78px] aspect-square object-cover"
              width={56}
              height={56}
              alt=""
            />
          ) : null}
        </div>
      </Link>
      <div className="flex flex-col ml-5 sm:my-[2px]">
        <div className="flex w-[270px] sm:w-[390px] justify-between">
          <div className="flex gap-1">
            <Link href={`/users/${profile.userId}`}>
              <span className="font-bold text-[12px] sm:text-base">
                {profile.nickname}
              </span>
            </Link>
            <span className="w-[10px] h-3 sm:w-[13px] sm:h-4 mt-2 sm:mt-[5px]">
              <Grade score={profile.point!} />
            </span>
          </div>

          <div>
            {profile.userId ===
            authService.currentUser?.uid ? null : profile?.follower!.includes(
                authService.currentUser?.uid as string
              ) ? (
              <button
                onClick={onClickFollowUpdate}
                className="w-[60px] h-5 text-[11px] sm:text-sm sm:w-[98px] sm:h-[30px] rounded-[100px] sm:rounded-[50px] bg-second  text-primary flex justify-center items-center mr-1"
              >
                팔로우
              </button>
            ) : (
              <button
                onClick={onClickFollowUpdate}
                className="w-[60px] h-5 text-[11px] sm:text-sm sm:w-[98px] sm:h-[30px] rounded-[100px] sm:rounded-[50px] bg-primary  text-white  flex justify-center items-center mr-1"
              >
                팔로우
              </button>
            )}
          </div>
        </div>
        <div className="text-[11px] sm:text-sm text-textGray max-h-9 sm:max-h-11 w-[268px] mt-1 text-ellipsis overflow-hidden">
          {profile.introduce}
        </div>
      </div>
    </div>
  );
};

export default FollowModalCard;
