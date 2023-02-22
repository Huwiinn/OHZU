import { authService, dbService } from "@/firebase";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import DeleteModal from "../delete_modal";
import Grade from "../grade";

interface RecommentListPropsType {
  recomment: CommentType;
}

const RecommentList = ({ recomment }: RecommentListPropsType) => {
  const { commentId, userId, createdAt, isEdit, content, id } = recomment;
  const [recommentUser, setRecommentUser] = useState<UserType>();
  const [editRecommentContent, setEditRecommentContent] = useState<string>();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const deleteToggle = () => {
    setDeleteConfirm(!deleteConfirm);
  };

  const editToggle = async () => {
    await updateDoc(doc(dbService, "Recomments", id as string), {
      isEdit: !isEdit,
    });
  };

  const editRecomment = async (id: string, edit: any) => {
    await updateDoc(doc(dbService, "Recomments", id), {
      ...recomment,
      content: edit,
      isEdit: false,
    });
    setEditRecommentContent("");
  };

  const deleteRecomment = async (id: string) => {
    await deleteDoc(doc(dbService, "Recomments", id));
  };

  const getRecommentUser = async () => {
    if (userId) {
      const userRef = doc(dbService, "Users", userId! as string);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      const newUser = {
        ...userData,
      };

      setRecommentUser(newUser);
    }
  };

  const onClickReportComment = async () => {
    const snapshot = await getDoc(
      doc(dbService, "ReportReComments", id as string)
    );
    const snapshotdata = await snapshot.data();
    const pastComment = {
      ...snapshotdata,
    };

    if (pastComment.reporter) {
      if (pastComment.reporter.includes(authService.currentUser?.uid)) {
        console.log("이미신고했습니당");
        return;
      } else {
        pastComment.reporter.push(authService.currentUser?.uid);
        await updateDoc(doc(dbService, "ReportReComments", id as string), {
          reporter: pastComment.reporter,
        });
        console.log("새로운 신고자!");
      }
    } else if (!pastComment.reporter) {
      const newComments = {
        commentId: id,
        content: content,
        reporter: [authService.currentUser?.uid],
      };
      await setDoc(
        doc(dbService, "ReportReComments", id as string),
        newComments
      );
      console.log("신고 완료");
    }
  };

  useEffect(() => {
    getRecommentUser();
  }, []);
  return (
    <>
      <li className="py-6 flex space-x-6 justify-end w-full border-b border-iconDefault">
        <Link
          href={`/users/${recomment.userId}`}
          className="flex flex-col items-center space-y-2 w-[13%]"
        >
          <img
            src={recommentUser?.imageURL}
            className="bg-slate-300 w-[40px] aspect-square rounded-full object-cover"
          />
          <div className="flex justify-start space-x-1">
            <span className="text-xs">{recommentUser?.nickname}</span>
            <span className="w-[12px]">
              <Grade score={recommentUser?.point!} />
            </span>
          </div>
        </Link>
        <div className="space-y-6 flex flex-col justify-between w-full">
          {isEdit ? (
            <textarea
              name="editContent"
              value={editRecommentContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setEditRecommentContent(e.target.value);
              }}
              className="w-full p-2 border h-10 resize-none placeholder:text-sm scrollbar-none"
              placeholder={content}
            />
          ) : (
            <pre className="whitespace-pre-wrap break-all">{content}</pre>
          )}
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 flex items-end">
              {createdAt}
            </span>
            {isEdit && (
              <div className="flex justify-end items-end space-x-2">
                <button className="text-xs font-medium" onClick={editToggle}>
                  취소
                </button>
                <button
                  className="text-xs font-medium"
                  onClick={() =>
                    editRecomment(id as string, editRecommentContent)
                  }
                >
                  완료
                </button>
              </div>
            )}
            {authService.currentUser?.uid === userId ? (
              <div
                className={`${
                  isEdit ? "hidden" : "flex"
                } flex justify-end items-end space-x-4 text-gray-500 text-xs`}
              >
                <button onClick={editToggle}>수정</button>
                {/* <button onClick={() => deleteComment(id as string)}>삭제</button> */}
                <button onClick={deleteToggle}>삭제</button>
              </div>
            ) : (
              <div className="flex justify-end items-end space-x-2 text-gray-500 text-xs w-1/6">
                <button onClick={onClickReportComment}>신고</button>
              </div>
            )}
          </div>
        </div>

        {deleteConfirm && (
          <DeleteModal
            deleteRecomment={deleteRecomment}
            setDeleteConfirm={setDeleteConfirm}
            id={id}
            text="답글"
          />
        )}
      </li>
    </>
  );
};
export default RecommentList;
