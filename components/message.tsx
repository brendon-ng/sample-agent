'use client';

import type { ChatRequestOptions, Message, ToolInvocation } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';

import type { Vote } from '@/lib/db/schema';

import { DocumentToolCall, DocumentToolResult } from './document';
import {
  PencilEditIcon,
  SparklesIcon,
} from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { DocumentPreview } from './document-preview';
import { MessageReasoning } from './message-reasoning';

interface PreviewMessageProps {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}

const PurePreviewMessage = ({
  message,
  chatId,
  isLoading,
  isReadonly,
  setMessages,
  reload,
  vote,
}: PreviewMessageProps) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-row gap-4">
          <div className="size-8" />

          <div className="flex-1">
            {message.content && mode === 'view' && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <Markdown>{message.content}</Markdown>
              </div>
            )}

            {message.content && mode === 'edit' && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )}

            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4">
                {message.toolInvocations.map((toolInvocation: ToolInvocation) => {
                  const { toolName, toolCallId, state, args } = toolInvocation;

                  if (state === 'result') {
                    const { result } = toolInvocation;

                    return (
                      <div key={toolCallId}>
                        {toolName === 'queryInvoices' ? (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="font-medium mb-2">{result.message}</p>
                            {result.data && (
                              <div className="mt-2">
                                {result.data.totalAmount && (
                                  <p>Total Amount: ${result.data.totalAmount.toFixed(2)}</p>
                                )}
                                {result.data.customers && (
                                  <div>
                                    <p className="font-medium">Customers:</p>
                                    <ul className="list-disc list-inside">
                                      {result.data.customers.map((customer: string) => (
                                        <li key={customer}>{customer}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {result.data.vendors && (
                                  <div>
                                    <p className="font-medium">Vendors:</p>
                                    <ul className="list-disc list-inside">
                                      {result.data.vendors.map((vendor: string) => (
                                        <li key={vendor}>{vendor}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {result.data.lineItems && (
                                  <div>
                                    <p className="font-medium">Line Items:</p>
                                    <ul className="list-disc list-inside">
                                      {result.data.lineItems.map((item: any) => (
                                        <li key={item.id}>
                                          {item.itemName} - {item.itemQuantity} x ${item.itemPrice.toFixed(2)}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {result.data.overdueInvoices && (
                                  <div>
                                    <p className="font-medium">Overdue Invoices:</p>
                                    <ul className="list-disc list-inside">
                                      {result.data.overdueInvoices.map((invoice: any) => (
                                        <li key={invoice.id}>
                                          Invoice #{invoice.invoiceNumber} - Due: {new Date(invoice.dueDate).toLocaleDateString()}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {result.data.invoiceNumbers && (
                                  <div>
                                    <p className="font-medium">Invoice Numbers:</p>
                                    <ul className="list-disc list-inside">
                                      {result.data.invoiceNumbers.map((number: string) => (
                                        <li key={number}>{number}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {result.data.invoices && (
                                  <div>
                                    <p className="font-medium">All Invoices:</p>
                                    <ul className="list-disc list-inside">
                                      {result.data.invoices.map((invoice: any) => (
                                        <li key={invoice.id}>
                                          Invoice #{invoice.invoiceNumber} - {invoice.customerName} - ${invoice.amount.toFixed(2)}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <pre>{JSON.stringify(result, null, 2)}</pre>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ['queryInvoices'].includes(toolName),
                      })}
                    >
                      {toolName === 'queryInvoices' ? (
                        <div className="bg-muted p-4 rounded-lg">
                          <p>Querying invoices...</p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.reasoning !== nextProps.message.reasoning)
      return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations,
      )
    )
      return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
