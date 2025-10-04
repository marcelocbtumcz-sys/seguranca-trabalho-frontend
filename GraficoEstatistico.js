import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Registrar módulos do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function GraficoEstatistico({ dados }) {
  const labels = dados.map((d) => d.label);
  const valores = dados.map((d) => d.total);

  const data = {
    labels,
    datasets: [
      {
        label: "Acidentes",
        data: valores,
        backgroundColor: "#4A90E2",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // 🔹 Esconde legenda
      },
      tooltip: {
        enabled: true,
      },
      title: {
        display: true,
        text: "Relatório Estatístico Geral",
      },
      datalabels: {
        anchor: "end",
        align: "end",
        color: "#000",
        font: {
          weight: "bold",
        },
        formatter: (value) => value,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
