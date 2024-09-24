import { useContext, useState } from 'react'
import { FontIcon, Stack, TextField } from '@fluentui/react'
import { SendRegular } from '@fluentui/react-icons'

import Send from '../../assets/Send.svg'

import styles from './QuestionInput.module.css'
import { ChatMessage } from '../../api'
import { AppStateContext } from '../../state/AppProvider'

interface Props {
  onSend: (question: ChatMessage['content'], id?: string) => void
  disabled: boolean
  placeholder?: string
  clearOnSend?: boolean
  conversationId?: string
}

export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend, conversationId }: Props) => {
  const [question, setQuestion] = useState<string>('')
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      await convertToBase64(file);
      setFileName(file.name);
    }
  };

  const convertToBase64 = async (file: Blob) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setBase64Image(reader.result as string);
    };

    reader.onerror = (error) => {
      console.error('Error: ', error);
    };
  };

  const sendQuestion = () => {
    if (disabled || (!question.trim() && !base64Image)) {
      return
    }

    const questionContent: ChatMessage['content'] = [];
    
    if (question.trim()) {
      questionContent.push({ type: "text", text: question });
    }

    if (base64Image) {
      questionContent.push({ type: "image_url", image_url: { url: base64Image } });
    }

    if (conversationId) {
      onSend(questionContent, conversationId)
    } else {
      onSend(questionContent)
    }

    setBase64Image(null)
    setFileName(null)

    if (clearOnSend) {
      setQuestion('')
    }
  }

  const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
    if (ev.key === 'Enter' && !ev.shiftKey && !(ev.nativeEvent?.isComposing === true)) {
      ev.preventDefault()
      sendQuestion()
    }
  }

  const onQuestionChange = (_ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    setQuestion(newValue || '')
  }

  const sendQuestionDisabled = disabled || (!question.trim() && !base64Image)

  return (
    <Stack horizontal className={styles.questionInputContainer}>
      <TextField
        className={styles.questionInputTextArea}
        placeholder={placeholder}
        multiline
        resizable={false}
        borderless
        value={question}
        onChange={onQuestionChange}
        onKeyDown={onEnterPress}
      />
      {fileName && <div className={styles.fileNameDisplay}>{fileName}</div>}
      <div className={styles.fileInputContainer}>
        <input
          type="file"
          id="fileInput"
          onChange={(event) => handleImageUpload(event)}
          accept="image/*"
          style={{ display: 'block' }} // Ensure it's visible for testing
        />
        <label htmlFor="fileInput" className={styles.fileLabel} aria-label='Upload Image'>
          <FontIcon
            className={styles.fileIcon}
            iconName={'PhotoCollection'}
            aria-label='Upload Image'
          />
          <span>Upload Image</span>
        </label>
      </div>
      {base64Image && <img className={styles.uploadedImage} src={base64Image} alt="Uploaded Preview" />}
      <div
        className={styles.questionInputSendButtonContainer}
        role="button"
        tabIndex={0}
        aria-label="Ask question button"
        onClick={sendQuestion}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ' ? sendQuestion() : null)}>
        {sendQuestionDisabled ? (
          <SendRegular className={styles.questionInputSendButtonDisabled} />
        ) : (
          <img src={Send} className={styles.questionInputSendButton} alt="Send Button" />
        )}
      </div>
      <div className={styles.questionInputBottomBorder} />
    </Stack>
  )
}
