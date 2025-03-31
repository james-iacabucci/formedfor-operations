
import { useState, KeyboardEvent } from "react";
import { UploadingFile } from "./types";
import { PendingFiles } from "./PendingFiles";
import { MessageInputField } from "./MessageInputField";
import { useTextareaAutosize } from "./hooks/useTextareaAutosize";
import { useMessageSend } from "./hooks/useMessageSend";
import { usePasteHandler } from "./hooks/usePasteHandler";
import { useUserRoles } from "@/hooks/use-user-roles";
