import { authService, dbService } from "@/firebase";
import useModal from "@/hooks/useModal";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Grade from "../grade";
import Recomments from "./recomments";
import useUpdateComment from "@/hooks/query/comment/useUpdateComment";
import { useGetUser } from "@/hooks/query/user/useGetUser";
import useDeleteComment from "@/hooks/query/comment/useDeleteComment";

interface CommentProps {
  comment: CommentType;
  currentUser: UserType;
  postTitle: string;
}

const CommentList = ({ comment, currentUser, postTitle }: CommentProps) => {
  const { content, createdAt, userId, id, isEdit, postId } = comment;

  const createdAtS = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "medium",
  }).format(createdAt);
  // get User
  const { data: user, isLoading: userLoading } = useGetUser(comment?.userId);

  const [editContent, setEditContent] = useState<string>(content);
  const [isOpen, setIsOpen] = useState(false);
  const [recomments, setRecomments] = useState<CommentType[]>([]);
  const [commentIsEdit, setCommentIsEdit] = useState(false);

  const { showModal, hideModal } = useModal();

  // textarea resize & onChange editContent
  const [resizeTextArea, setResizeTextArea] = useState({
    rows: 1,
    minRows: 1,
    maxRows: 3,
  });

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    const textareaLineHeight = 26;
    const { minRows, maxRows } = resizeTextArea;

    const previousRows = event.target.rows;
    event.target.rows = minRows;

    const currentRows = ~~(event.target.scrollHeight / textareaLineHeight);

    if (currentRows === previousRows) {
      event.target.rows = currentRows;
    }

    if (currentRows >= maxRows) {
      event.target.rows = maxRows;
      event.target.scrollTop = event.target.scrollHeight;
    }

    setResizeTextArea({
      ...resizeTextArea,
      rows: currentRows < maxRows ? currentRows : maxRows,
    });

    setEditContent(value);
  };

  useMemo(() => {
    if (editContent) {
      const editDefaultLength = editContent.split("\n").length;
      if (editDefaultLength > 3) {
        setResizeTextArea({
          ...resizeTextArea,
          rows: 3,
        });
      } else {
        setResizeTextArea({
          ...resizeTextArea,
          rows: editDefaultLength,
        });
      }
    }
  }, [editContent]);

  // Update comment
  const editToggle = async () => {
    setCommentIsEdit(!commentIsEdit);
  };

  const { isLoading: isLoadingEdit, mutate: updateComment } =
    useUpdateComment(id);

  const onEditComment = async () => {
    if (editContent.trim() !== "") {
      const editComment: any = {
        ...comment,
        content: editContent,
      };
      await updateComment({ commentId: id, editCommentObj: editComment });
      setEditContent("");
      setCommentIsEdit(false);
    }
  };

  // Delete comment
  const { isLoading: removeCommentLoading, mutate: deleteComment } =
    useDeleteComment(id);

  const onDeleteComment = async () => {
    await deleteComment(id);

    hideModal();
  };

  const resetToggle = async () => {
    setCommentIsEdit(false);
  };

  const getRecomments = async () => {
    const q = query(
      collection(dbService, "Recomments"),
      orderBy("createdAt", "asc"),
      where("commentId", "==", id as string)
    );

    onSnapshot(q, (snapshot) => {
      // q (쿼리)안에 담긴 collection 내의 변화가 생길 때 마다 매번 실행됨
      const newRecomments = snapshot.docs.map((doc: any) => {
        const newRecomment = {
          id: doc.id,
          ...doc.data(), // doc.data() : { text, createdAt, ...  }
        };
        return newRecomment;
      });
      setRecomments(newRecomments);
    });
  };

  const onClickReportComment = async () => {
    if (authService.currentUser?.uid) {
      const snapshot = await getDoc(
        doc(dbService, "ReportComments", id as string)
      );
      const snapshotdata = await snapshot.data();
      const pastComment = {
        ...snapshotdata,
      };

      if (pastComment.reporter) {
        if (
          pastComment.reporter
            .map((rep: any) => rep.userId === authService.currentUser?.uid)
            .includes(true)
        ) {
          showModal({
            modalType: "AlertModal",
            modalProps: { title: "이미 신고한 댓글입니다." },
          });
          return;
        } else {
          showModal({
            modalType: "ReportModal",
            modalProps: {
              type: "comment",
              post: comment,
              currentUser,
              pastPost: pastComment,
            },
          });
        }
      } else if (!pastComment.reporter) {
        showModal({
          modalType: "ReportModal",
          modalProps: {
            type: "comment",
            post: comment,
            currentUser,
            pastPost: pastComment,
          },
        });
      }
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

  useEffect(() => {
    resetToggle();
    getRecomments();
    return;
  }, []);

  return (
    <>
      <li className="flex flex-col items-center justify-start py-5 px-4 border-b border-borderGray last:border-b-0 w-full">
        <div className="flex space-x-3 sm:space-x-6 justify-start w-full">
          <Link
            aria-label="user-img"
            href={{
              pathname: `/users/${user?.nickname.replaceAll(" ", "_")}`,
              query: {
                userId: comment.userId,
              },
            }}
            as={`/users/${user?.nickname.replaceAll(" ", "_")}`}
            className="flex flex-col items-center space-y-2 w-[32px] sm:w-[40px] aspect-square"
          >
            {user?.imageURL && (
              <Image
                width={48}
                height={48}
                alt=""
                src={user?.imageURL as string}
                className="w-8 sm:w-10 aspect-square rounded-full object-cover"
              />
            )}
          </Link>
          <div className="flex flex-col justify-between w-[calc(100%-2.5rem)] sm:w-[calc(100%-3rem)]">
            <div className="flex justify-start items-center mb-0.5">
              <span className="text-xs mr-1">{user?.nickname}</span>
              <span className="w-[8px] sm:w-[12px] mr-2">
                <Grade score={user?.point!} />
              </span>
              <span className="text-xs text-gray-500 flex items-end">
                {createdAtS}
              </span>
            </div>
            {commentIsEdit ? (
              <textarea
                name="editContent"
                value={editContent}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded border border-phGray h-auto scrollbar-none resize-none focus-visible:outline-none text-sm sm:text-base"
                rows={resizeTextArea.rows}
                placeholder={content}
              />
            ) : (
              <pre className="whitespace-pre-wrap break-all text-sm sm:text-base">
                {content}
              </pre>
            )}
            <div className="flex justify-end mt-2">
              {commentIsEdit && (
                <div className="flex justify-end items-end space-x-6">
                  <button
                    aria-label="cancel"
                    className="text-xs font-medium hover:text-black text-textGray"
                    onClick={editToggle}
                  >
                    취소
                  </button>
                  <button
                    aria-label="done"
                    className="text-xs font-medium hover:text-black text-textGray"
                    onClick={onEditComment}
                  >
                    완료
                  </button>
                </div>
              )}
              {authService.currentUser?.uid === userId ? (
                <div
                  className={`${
                    commentIsEdit ? "hidden" : "flex"
                  } flex justify-end items-end space-x-6 text-xs`}
                >
                  <button
                    aria-label="edit-comment"
                    onClick={editToggle}
                    className="hover:text-black text-textGray"
                  >
                    수정
                  </button>
                  <button
                    aria-label="delete-comment"
                    onClick={() =>
                      showModal({
                        modalType: "ConfirmModal",
                        modalProps: {
                          title: "댓글을 삭제 하시겠어요?",
                          text: "삭제한 댓글은 복원이 불가합니다.",
                          rightbtntext: "삭제",
                          rightbtnfunc: onDeleteComment,
                        },
                      })
                    }
                    className="hover:text-black text-textGray"
                  >
                    삭제
                  </button>
                  {recomments.length === 0 ? (
                    <button
                      aria-label="recomment"
                      onClick={() => {
                        setIsOpen(!isOpen);
                      }}
                      className={`${
                        isOpen ? "text-black" : "text-textGray"
                      } hover:text-black`}
                    >
                      답글달기
                    </button>
                  ) : (
                    <button
                      aria-label="recomment"
                      onClick={() => {
                        setIsOpen(!isOpen);
                      }}
                      className={`${
                        isOpen ? "text-black" : "text-textGray"
                      } hover:text-black`}
                    >
                      답글 {recomments.length}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex justify-end items-end space-x-6 text-gray-500 text-xs">
                  <button aria-label="report" onClick={onClickReportComment}>
                    신고
                  </button>
                  {recomments.length === 0 ? (
                    <button
                      aria-label="recomment"
                      onClick={() => {
                        setIsOpen(!isOpen);
                      }}
                      className={`${isOpen ? "text-black" : "text-textGray"}`}
                    >
                      답글달기
                    </button>
                  ) : (
                    <button
                      aria-label="recomment"
                      onClick={() => {
                        setIsOpen(!isOpen);
                      }}
                      className={`${isOpen ? "text-black" : "text-textGray"}`}
                    >
                      답글 {recomments.length}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {isOpen && (
          <Recomments
            id={id!}
            currentUser={currentUser}
            recomments={recomments}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            comment={comment}
            postId={postId}
            postTitle={postTitle}
          />
        )}
      </li>
    </>
  );
};

export default CommentList;
