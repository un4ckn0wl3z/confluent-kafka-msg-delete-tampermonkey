// ==UserScript==
// @name         Confluent Kafka Msg Deletion
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Delete and recreate Kafka topics via Confluent REST API
// @author       un4ckn0wl3z
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// ==/UserScript==

(function() {
    'use strict';

    function extractClusterAndTopicFromURL() {
        const urlParts = window.location.pathname.split("/");
        const clusterIndex = urlParts.indexOf("clusters");
        const topicIndex = urlParts.indexOf("topics");

        if (clusterIndex !== -1 && topicIndex !== -1 && topicIndex > clusterIndex) {
            return {
                clusterId: urlParts[clusterIndex + 1],
                topicName: urlParts[topicIndex + 1]
            };
        }
        return {
            clusterId: "default-cluster",
            topicName: "default-topic"
        };
    }

    const KAFKA_REST_URL = "http://localhost:9021/2.0/kafka/";

    function deleteTopic() {
        let {
            clusterId,
            topicName
        } = extractClusterAndTopicFromURL();

        GM_xmlhttpRequest({
            method: "DELETE",
            url: `${KAFKA_REST_URL}${clusterId}/topics/${topicName}`,
            onload: function(response) {
                console.log("Topic deleted:", response.responseText);
                setTimeout(createTopic, 3000); // Wait 3s before creating a new topic
            },
            onerror: function(error) {
                console.error("Failed to delete topic:", error);
            }
        });
    }

    function createTopic() {
        let {
            clusterId,
            topicName
        } = extractClusterAndTopicFromURL();

        GM_xmlhttpRequest({
            method: "PUT",
            url: `${KAFKA_REST_URL}${clusterId}/topics?validate=false`,
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify(
                {"name": topicName,"numPartitions":"1","replicationFactor":"1","configs":{"compression.type":"producer","confluent.value.schema.validation":"false","confluent.tier.cleaner.compact.min.efficiency":"0.5","leader.replication.throttled.replicas":"","confluent.key.subject.name.strategy":"io.confluent.kafka.serializers.subject.TopicNameStrategy","min.insync.replicas":"1","message.downconversion.enable":"true","segment.jitter.ms":"0","confluent.tier.cleaner.enable":"false","cleanup.policy":"delete","confluent.compacted.topic.prefer.tier.fetch.ms":"-1","flush.ms":"9223372036854775807","confluent.tier.local.hotset.ms":"86400000","follower.replication.throttled.replicas":"","confluent.value.subject.name.strategy":"io.confluent.kafka.serializers.subject.TopicNameStrategy","confluent.tier.local.hotset.bytes":"-1","retention.ms":"604800000","segment.bytes":"1073741824","flush.messages":"9223372036854775807","confluent.tier.enable":"false","confluent.tier.segment.hotset.roll.min.bytes":"104857600","confluent.segment.speculative.prefetch.enable":"false","message.format.version":"3.0-IV1","file.delete.delay.ms":"60000","max.compaction.lag.ms":"9223372036854775807","confluent.tier.cleaner.compact.segment.min.bytes":"20971520","confluent.tier.cleaner.dual.compaction":"false","max.message.bytes":"1048588","min.compaction.lag.ms":"0","message.timestamp.type":"CreateTime","preallocate":"false","index.interval.bytes":"4096","min.cleanable.dirty.ratio":"0.5","unclean.leader.election.enable":"false","retention.bytes":"-1","delete.retention.ms":"86400000","confluent.tier.cleaner.min.cleanable.ratio":"0.75","confluent.prefer.tier.fetch.ms":"-1","segment.ms":"604800000","confluent.key.schema.validation":"false","message.timestamp.difference.max.ms":"9223372036854775807","segment.index.bytes":"10485760"}}
            ),
            onload: function(response) {
                console.log("Topic created:", response.responseText);
            },
            onerror: function(error) {
                console.error("Failed to create topic:", error);
            }
        });
        alert('Done!');
       // location.reload();
    }


    // Create a MutationObserver to watch for the element
    const observer = new MutationObserver((mutationsList, observer) => {
        // Check if the element is found
        const element = document.querySelector('#controlcenter > div > div.Root__RootWrapper-uetipj-0.ctsZPi > div > div.App__Wrapper-sc-1ood5tq-2.dSOMSu > div.App__MainContent-sc-1ood5tq-1.fDUPwC > div.SubNavLayout__PageContent-gkwqg5-3.kIwjSw > div > div > div > div.ContentPanel-e6omeu-0.MjHhE > div.StyleGuide__InfoCardSection-lclu2k-82.etNtqC > div > div.Stack-sc-1vnifuo-0.hiqhXd > button');
        console.log('lookup!');
        if (element) {
            observer.disconnect();

            console.log('Element found!');
            // Do something with the element or stop the observer
            let btn = document.createElement("button");
            btn.innerText = "Recreate Kafka Topic";
            btn.id = "delTopic"; // Set the id here
            // btn.style.position = "fixed";
            btn.style.bottom = "2px";
            btn.style.right = "2px";
            btn.style.zIndex = "1000";
            btn.style.padding = "5px";
            btn.style.background = "red";
            btn.style.color = "white";
            btn.style.border = "none";
            btn.style.cursor = "pointer";
            btn.style.borderRadius = "2px"; // Add this line for rounded corners
            btn.style.marginRight = "5px"; // Add this line for left margin

            //document.body.appendChild(btn);
            element.insertAdjacentElement('afterend', btn); // Adds the button after the target element

            btn.addEventListener("click", function() {
                let {
                    clusterId,
                    topicName
                } = extractClusterAndTopicFromURL();

                if (confirm(`Are you sure you want to delete and recreate the topic ${topicName}?`)) {
                    deleteTopic();
                }
            });

            console.log('BTN added!');

        }
    });
    // Start observing the document for added nodes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });




})();
