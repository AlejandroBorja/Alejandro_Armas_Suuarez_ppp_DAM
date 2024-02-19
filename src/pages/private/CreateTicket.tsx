
import React, { useState } from 'react';
import jsPDF from 'jspdf';

interface CreateTicketProps {
  eventName: string;
  eventDate: string | null;
}

const CreateTicket: React.FC<CreateTicketProps> & {
  generatePdfContent: (eventName: string, eventDate: string | null) => ArrayBuffer;
} = ({ eventName, eventDate }) => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const generatePdfContent = () => {
    try {
      const pdf = new jsPDF();
      const content = `Evento: ${eventName}\nFecha: ${eventDate || 'Fecha no disponible'}`;
      pdf.text(content, 20, 20);
      const pdfContent = pdf.output('arraybuffer');
      return pdfContent;
    } catch (error) {
      console.error('Error al generar el contenido del PDF:', error);
      throw error;
    }
  };

  const createTicket = () => {
    try {
      const pdfContent = generatePdfContent();
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      setDownloadUrl(downloadUrl);
    } catch (error) {
      console.error('Error al crear el ticket:', error);
    }
  };

  return (
    <div>
      <button onClick={createTicket}>Comprar Ticket</button>
      {downloadUrl && (
        <p>
          Descarga tu ticket en la aplicación:{' '}
          <a href={downloadUrl} download={`${eventName}_Ticket.pdf`}>
            Descargar Ticket
          </a>
        </p>
      )}
    </div>
  );
};

CreateTicket.generatePdfContent = (eventName: string, eventDate: string | null) => {
  const pdf = new jsPDF();
  const content = `Evento: ${eventName}\nFecha: ${eventDate || 'Fecha no disponible'}`;
  pdf.text(content, 20, 20);
  return pdf.output('arraybuffer');
};

export default CreateTicket;
