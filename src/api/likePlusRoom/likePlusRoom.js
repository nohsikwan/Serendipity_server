import { prisma } from "../../../generated/prisma-client";

export default {
  Query: {
    something: () => "something"
  },
  Mutation: {
    likeUser: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);

      const { user } = request;
      const { selectedId } = args;
      try {
        await prisma.updateUser({
          where: { id: user.id },
          data: {
            myLikes: {
              connect: {
                id: selectedId
              }
            }
          }
        });

        const youLikeMe = await prisma.$exists.user({
          AND: [
            {
              id: selectedId
            },
            {
              myLikes_some: {
                id: user.id
              }
            }
          ]
        });
        const mylikeBy = await prisma.$exists.user({
          AND: [
            {
              id: user.id
            },
            {
              myLikes_some: {
                id: selectedId
              }
            }
          ]
        });
        // 서로 liked 가 존재하여 createRoom 생성하기
        if (youLikeMe && mylikeBy) {
          // 	 const { user } = request;
          //   const { selectedId } = args;

          const room = await prisma.createRoom({
            participants: {
              connect: [{ id: user.id }, { id: selectedId }]
            }
          });

          return `${room.id}`;
        } else {
          return "The request has been successfully processed.";
        }
      } catch (error) {
        throw new Error(`${error}`);
      }
    }
  }
};