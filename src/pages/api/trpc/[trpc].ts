import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/routers/_app';
import { ZodError } from 'zod';
import { createContext } from '@/server/context';
// export API handler
// @link https://trpc.io/docs/v11/server/adapters
export default trpcNext.createNextApiHandler({
  router: appRouter,
  onError: ({ error }) => {
    if (error.cause instanceof ZodError) {
        // Returning only first zod error message to client
        error.message = JSON.parse(error.message)[0].message;
    }
  },
  createContext: createContext,
});
